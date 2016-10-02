module conventionalGithubReleaser {
  function conventionalGithubReleaser(auth: any, changelogOpts: any,
                                      context: any, gitRawCommitsOpts?: any,
                                      parserOpts?: any, writerOpts?: any, userCb?: any): void;
}

declare module "conventional-github-releaser" {
  export = conventionalGithubReleaser;
}