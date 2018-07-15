```yaml
version: 2

base_image: &base_image
  image: circleci/node:8.9.4

job_common: &job_common
  docker:
    - <<: *base_image

save: &save
  save_cache:
    key: code-{{ .Revision }}
    paths:
      - .
      # save the git commit and ssh config
      - ".git"
      - "~/.ssh"

restore: &restore
  restore_cache:
    key: code-{{ .Revision }}

jobs:
  job1:
    <<: *job_common
    steps:
      - checkout
      - run: 'sudo yarn global add greenkeeper-lockfile@2'
      - run: 'greenkeeper-lockfile-update'
      - run: 'echo job1 installed greenkeeper-lockfile and ran greenkeeper-lockfile-update'
      - <<: *save
  job2:
    <<: *job_common
    steps:
      - run: 'echo this is job2'
  job3:
    <<: *job_common
    steps:
      - <<: *restore
      - run: 'sudo yarn global add greenkeeper-lockfile@2'
      # optionally ignore ssh hosts unknown error if you don't want to save ~/.ssh between jobs
      # - run:
          # name: SSH Avoid hosts unknown
          # command: 'mkdir -p ~/.ssh/ && echo -e "Host github.com\n\tStrictHostKeyChecking no\n" > ~/.ssh/config'
      - run: 'greenkeeper-lockfile-upload'
      - run: 'echo job3 ran greenkeeper-lockfile-upload'

workflows:
  version: 2
  circleci_example:
    jobs:
      - job1
      - job2:
          requires:
            - job1
      - job3:
          requires:
            - job2
```
