import {context} from '@actions/github'
import * as core from '@actions/core'

export function getContent(content: string): string[] {
  return content.trim().split('\n')
}

export function getShas(): {base: string; head: string} {
  let base = ''
  let head = ''

  switch (context.eventName) {
    case 'pull_request':
      base = context.payload.pull_request?.base?.sha
      head = context.payload.pull_request?.head?.sha
      break
    case 'push':
      base = context.payload.before
      head = context.payload.after
      break
    default:
      core.setFailed(
        `This action only supports pull requests and pushes, ${context.eventName} events are not supported. ` +
          "Please submit an issue on this action's GitHub repo if you believe this in correct."
      )
  }

  return {base, head}
}

export function getChanges(patch: string): {label: string; title: string} {
  const newChange = /(?:^|\s)\+(.*?)$/g
  const matches = newChange.exec(patch)?.entries() || []
  let [label, title] = ''
  for (const match of matches) {
    ;[label, title] = match[1].split(':')
  }

  return {label, title}
}
