#!/usr/bin/env groovy

// https://github.com/camunda/jenkins-global-shared-library
@Library('camunda-ci') _

import org.camunda.helper.GitUtilities

camundaGitHubWorkflowDispatch([
  cloud: 'operate-ci',
  credentialsId: 'github-operate-app',
  dryRun: params.DRY_RUN,
  inputs: [
    app_name:  GitUtilities.getSanitizedBranchName([BRANCH_NAME: params.BRANCH]).replaceAll(/[^a-z0-9]/, '-'),
    chart_ref: params.BRANCH,
    docker_tag: params.DOCKER_TAG,
  ],
  org: 'camunda',
  ref: params.REF,
  repo: 'operate',
  workflow: 'deploy-preview-env.yml',
])
