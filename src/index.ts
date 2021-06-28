import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { ExecOptions } from '@actions/exec/lib/interfaces';

const MAJOR: string = 'MAJOR';
const MINOR: string = 'MINOR';
const PATCH: string = 'PATCH';
const PRE_RELEASE: string = 'PRE_RELEASE';
const NUMBER_OF_COMMITS: string = 'NUMBER_OF_COMMITS';
const NUMBER_OF_COMMITS_SINCE_TAG: string = 'NUMBER_OF_COMMITS_SINCE_TAG';

process.on('unhandledRejection', handleError)
main().catch(handleError)

async function main(): Promise<void> {
    try {

        let tag = await getLastestTag();
        if (tag) {
            await getNumberOfCommits();

            await getNumberOfCommitsSinceTag(tag);

            formatSemanticValuesFromTag(tag);
        } else {
            core.setFailed(`No valid tag found: ${tag}`)
        }

    } catch (error) {
        core.setFailed(error.message);
    }
}

async function getLastestTag(): Promise<string | undefined> {
    let tag: string | undefined;
    const options: ExecOptions = {
        listeners: {
            stdout: (data: Buffer) => {
                tag = data.toString().trim();
                core.info(tag);
                core.info(`Tag retreived: ${tag}`);
            },
            stderr: (data: Buffer) => {
                core.error(data.toString().trim());
                core.setFailed('No tag found on this branch, please verify you have one in your remote repository and the fetch-depth option set to 0, on the checkout action.');
            }
        }
    };

    await exec.exec('git', ['describe', '--tags', '--abbrev=0'], options);

    return tag;
}

function formatSemanticValuesFromTag(tag: String) {

    if (tag.includes('v')) {
        tag = tag.split('v')[1];
    }

    let versionsIndicator = tag.split('.');

    if (versionsIndicator.length > 2 && versionsIndicator[2].includes('-')) {
        const preSplit = versionsIndicator[2].split('-');
        // Replacing PATCH split with pre release tag split
        versionsIndicator[2] = preSplit[0];
        core.exportVariable(PRE_RELEASE, preSplit[1]);
    } else {
        // setting empty string a pre-release
        core.exportVariable(PRE_RELEASE, '');
    }

    core.exportVariable(MAJOR, versionsIndicator[0]);
    core.exportVariable(MINOR, versionsIndicator[1]);
    core.exportVariable(PATCH, versionsIndicator[2]);
}

async function getNumberOfCommits(): Promise<void> {
    const options: ExecOptions = {
        listeners: {
            stdout: (data: Buffer) => {
                core.exportVariable(NUMBER_OF_COMMITS, data.toString().trim());
            },
            stderr: (data: Buffer) => {
                core.error(data.toString());
                core.setFailed('Unable to get the number of commits. See error above.');
            }
        }
    };

    await exec.exec('git', ['rev-list', '--count', 'HEAD'], options);
}

async function getNumberOfCommitsSinceTag(tag: String): Promise<void> {
    const options: ExecOptions = {
        listeners: {
            stdout: (data: Buffer) => {
                core.exportVariable(NUMBER_OF_COMMITS_SINCE_TAG, data.toString().trim());
            },
            stderr: (data: Buffer) => {
                core.error(data.toString());
                core.setFailed('Unable to get the number of commits since this tag. See error above.');
            }
        }
    };

    await exec.exec('git', ['rev-list', `${tag}..HEAD`, '--count'], options);
}

function handleError(err: any): void {
    console.error(err)
    core.setFailed(`Unhandled error: ${err}`)
}