import * as core from '@actions/core'
import * as github from '@actions/github'
import {inspect} from 'util'

import {getShas} from './util'

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
    core.debug(`owner: ${inspect(owner)}`)
    core.debug(`repo: ${inspect(repo)}`)

    if (inputs.token.length === 0 && inputs.dryRun) {
      core.info('empty token')
      return
    }

    // const octokit = github.getOctokit(inputs.token)

    // get sha for changes
    const {base, head} = getShas(github.context.eventName)
    core.debug(`base: ${base}`)
    core.debug(`head: ${head}`)
    // get changes
    // check if new lines added to relevant file
    // create issues for relevant changes
    // label issues
  } catch (error: Error | unknown) {
    if (error instanceof Error) {
      core.debug(inspect(error))
      core.setFailed(error.message)
    }
  }
}

run()
