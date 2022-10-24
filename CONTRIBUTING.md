# Contribution Guidelines

A Contribution Guideline shall facilitate the foundation for a collaborative ground for every contributor working on Swapr codebase(s).

## Project Management Software

We use [ZenHub](https://zenhub.com), an agile project management which is tightly integrated with GitHub. Contact one of the core contributors to invite you to the ZenHub board.

## Tickets

- Every task needs have an estimated ticket
- If you see something during work which is out of scope of the ticket:
  1. make a new ticket or reopen a ticket if exists.
  2. finish the current ticket first.
  3. If not depending on the other ticket, make a new branch from the **develop** branch, not the branch you are working on.
  4. No ticket is needed, but a branch, if you can do it under one hour. If you see that it takes longer, make a ticket with estimate.
  5. You can restimate your tickets if you see its much more work. But do not use it to track hours. It's NOT time tracking.

## Git Branches

- One ticket, one branch.
- If the ticket involes subtasks
  - Create a parent ticket
  - Branch out from parent ticket and merge from subtickets
  - Merge parent ticket to `develop`
- Use `feat/{description}`, `bug/{description}`, `docs/{description}`, or `chore/{description}` (chore to fix typo and little stuff)
- Avoid working on the `main` branch unless absolutely necessary. Branch names should be named after what they do.
- sub-branch like `feat/stufspecial/otherstuff` should not happen. You can work for yourself in this structure, but please don't get others to work in your sub-branch (It's a sign that something is off. We add too much complexity to non-complex stuff.)

Some more toughts on branches see [Phil Hord's answer on Stack Overflow](https://stackoverflow.com/a/6065944/2151050).

## Pull Requests (PR)

- PRs should target `develop` branch,
- A subtask PR should target parent branch.
- Draft PRs should be used when a PR is Work In Progress (WIP).
- If you make a PR from `feat/stufspecial/otherstuff` to `feat/stufspecial` you should pull it yourself.
- After a PR is merged, the branch can be deleted after two weeks.

## Releasing a new version

To release a new version:

- merge `develop` in the `master` branch
- increase the version in the `package.json` file, and commit the change as `vx.x.x`
- tag the commit and push the changes

## Project Structure

At Swapr, we are using React to build the frontend.

### General Components

A General Component is a React Component that is primitive. Each component can have its own style, defined in the `styled.jsx` file.

1. Directory: `src/components`
2. Component: `src/components/<ComponentName>/index.jsx`
3. Style: `src/components/<ComponentName>/styled.jsx`

### Pages

A Page is a single page component.

- Directory `src/pages/<PageName>.jsx`

### React Hooks

- Directory `src/hooks`
- Directory `src/contexts`

### Assets

- Directory `src/assets`
- Images in `src/assets/images`
- SVG in `src/assets/svg`

### App State (Context)

The application state is managed with multiple contexts, generally one for each section.

- Directory `src/contexts`

### Graphql queries

To fetch data from the subgraph the application uses graphql queries.

- Directory `src/apollo/queries.js`

That are used by the different clients (one for each network)

- Directory `src/apollo/client.js`

### Styles

- Directory `src/styles`
- Theme and global style in `src/Theme/index.jsx`

## Coding Standards

At DXdao, everyone thrives to write high-quality code. And such as every Contributor should follow _best practices_ to achieve their goals.

### Code Indentation

Use two space to intend code. Lint code using Prettier. Configurations are stored in `.prettierrc` IDE of choice should be able to format file upon saving file.

### Naming Convention

#### React Components

- Use `TitleCase` for Components

#### Functions/Variables

Use `camelCase` for variables and functions

#### Constants

Use `CAPITAL_CASE` for constants.