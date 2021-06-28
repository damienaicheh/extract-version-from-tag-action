# Extract version from tag action

This action extract the version from tag and provide different outputs to use in the `job`.

## Usage

To be able to use this action, you must retreive all the history of the repository by using the `fetch-depth` option of the `actions/checkout@v2` as bellow

```yaml
- name: Checkout
  uses: actions/checkout@v2
  with:
    fetch-depth: 0 # Mandatory to use the extract version from tag action

- name: Extract version from tag
  uses: damienaicheh/extract-version-from-tag-action@v1.0.0
```

You will then have access to these outputs:

- The major digit: `$MAJOR`
- The minor digit: `$MINOR`
- The patch digit: `$PATCH`

- If it's a pre-release with like for exemple the `-beta1` the value `beta1` will be extracted inside `$PRE_RELEASE`. If no pre-release is found this output will be empty.

- The number of commits will be available inside: `$NUMBER_OF_COMMITS`.
- The number of commits since tag will be available inside: `$NUMBER_OF_COMMITS_SINCE_TAG`.