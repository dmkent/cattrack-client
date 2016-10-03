declare module 'conventional-github-releaser' {
  function conventionalGithubReleaser(auth: any, changelogOpts: any,
                                      context: any, gitRawCommitsOpts?: any,
                                      parserOpts?: any, writerOpts?: any, userCb?: any): void;
  module conventionalGithubReleaser {}
  export = conventionalGithubReleaser;
}
