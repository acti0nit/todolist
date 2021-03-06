import * as core from '@actions/core'
import * as github from '@actions/github'
import {inspect} from 'util'

import {getChanges, getShas, Todo} from './util'

async function run(): Promise<void> {
  try {
    const inputs = {
      token: core.getInput('token'),
      repository: core.getInput('repository'),
      contentFilepath: core.getInput('content-filepath'),
      dryRun: JSON.parse(core.getInput('dry-run'))
    }
    core.debug(`Inputs: ${inspect(inputs)}`)

    const [owner, repo] = inputs.repository.split('/')
    core.debug(`owner: ${inspect(owner)}`)
    core.debug(`repo: ${inspect(repo)}`)

    if (inputs.token.length === 0 && inputs.dryRun) {
      core.info('empty token')
      return
    }

    const octokit = github.getOctokit(inputs.token)

    // get sha for changes
    const {base, head} = getShas()
    core.debug(`base: ${base}`)
    core.debug(`head: ${head}`)
    // get changes
    const response = await octokit.rest.repos.compareCommits({
      base,
      head,
      owner: github.context.repo.owner,
      repo: github.context.repo.repo
    })

    // Ensure that the request was successful.
    if (response.status !== 200) {
      core.setFailed(
        `The GitHub API for comparing the base and head commits for this ${github.context.eventName} event returned ${response.status}, expected 200. ` +
          "Please submit an issue on this action's GitHub repo."
      )
    }

    // Ensure that the head commit is ahead of the base commit.
    if (response.data.status !== 'ahead') {
      core.setFailed(
        `The head commit for this ${github.context.eventName} event is not ahead of the base commit. ` +
          "Please submit an issue on this action's GitHub repo."
      )
    }

    // check if new lines added to relevant file
    const files = response.data.files?.entries() || []

    core.debug(`files: ${files}`)
    let todolist: Todo[] = []
    for (const file of files) {
      const f = file[1]
      core.debug(`file: ${JSON.stringify(f, null, 2)}`)
      if (f.filename !== inputs.contentFilepath) {
        core.debug(`wrong filename: ${f.filename}`)
        continue
      }
      const changes = getChanges(f.patch || '')
      core.debug(`changes: ${JSON.stringify(changes, null, 2)}`)
      todolist = todolist.concat(changes)
    }
    core.debug(`todolist: ${JSON.stringify(todolist, null, 2)}`)

    // create issues for relevant changes
    for (const change of todolist) {
      const {label, title} = change
      if (inputs.dryRun) {
        core.debug(`creating issue:`)
        core.debug(`label: ${label}`)
        core.debug(`title: ${title}`)
        continue
      }
      octokit.rest.issues.create({
        owner,
        repo,
        title,
        labels: [label]
      })
    }
    // label issues
  } catch (error: Error | unknown) {
    if (error instanceof Error) {
      core.debug(inspect(error))
      core.setFailed(error.message)
    }
  }
}

run()
