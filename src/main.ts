import * as core from '@actions/core'
import * as github from '@actions/github'
import * as fs from 'fs'
import * as util from 'util'
import {inspect} from 'util'

import {getContent} from './util'

async function run(): Promise<void> {
  try {
    const inputs = {
      token: core.getInput('token'),
      repository: core.getInput('repository'),
      contentFilepath: core.getInput('content-filepath'),
      dryRun: core.getInput('dry-run')
    }
    core.debug(`Inputs: ${inspect(inputs)}`)

    const [owner, repo] = inputs.repository.split('/')
    core.debug(`Repo: ${inspect(repo)}`)

    if (inputs.token.length === 0 && inputs.dryRun) {
      core.info('empty token')
      return
    }

    const octokit = github.getOctokit(inputs.token)
    const issues: number[] = []

    // check file exists
    if (await util.promisify(fs.exists)(inputs.contentFilepath)) {
      // fetch file
      const fileContent = await fs.promises.readFile(inputs.contentFilepath, {
        encoding: 'utf8'
      })

      for (const issueRaw of getContent(fileContent)) {
        // get title and label
        const [label, title] = issueRaw.split(/:/)

        const issueNumber = await (async (): Promise<number> => {
          // TODO:feat:update existing issue
          // if (inputs.issueNumber) {
          //   await octokit.rest.issues.update({
          //     owner: owner,
          //     repo: repo,
          //     issue_number: inputs.issueNumber,
          //     title: inputs.title,
          //     body: fileContent
          //   })
          //   core.info(`Updated issue #${inputs.issueNumber}`)

          //   return inputs.issueNumber
          // }
          // create issue
          if (inputs.dryRun) {
            core.info(
              `Creating issue:\n  - owner:\t${owner}\n  - repo:\t${repo}\n  - title:\t${title}`
            )
            return 42
          }

          const {data: issue} = await octokit.rest.issues.create({
            owner,
            repo,
            title,
            body: ':rocket:'
          })
          core.info(`Created issue #${issue.number}`)

          return issue.number
        })()

        core.info(`Applying label '${label}'`)
        if (!inputs.dryRun) {
          await octokit.rest.issues.addLabels({
            owner,
            repo,
            issue_number: issueNumber,
            labels: [label]
          })
        }
        issues.push(issueNumber)
      }

      // TODO: apply assignees
      // if (inputs.assignees.length > 0) {
      //   core.info(`Applying assignees '${inputs.assignees}'`)
      //   await octokit.rest.issues.addAssignees({
      //     owner: owner,
      //     repo: repo,
      //     issue_number: issueNumber,
      //     assignees: inputs.assignees
      //   })
      // }

      // set output
      core.setOutput('issues', issues.join(','))
    } else {
      new Error(`File not found at path '${inputs.contentFilepath}'`)
    }
  } catch (error: Error | unknown) {
    if (error instanceof Error) {
      core.debug(inspect(error))
      core.setFailed(error.message)
    }
  }
}

run()
