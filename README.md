# Widget Registry ![Coverage](https://js-widgets.github.io/js-widgets/assets/coverage.svg)

The Widget Registry is a project that allows you to maintain a registry of JavaScript applications. The goal of this project is to be able to **register** your JS application (React, Vue, vanilla JS, ...) so it can be discoverable and embedded in other places seamlessly.

## Statically self hosted
The goal of this project is to give you the ability to create your own independent widget registry and host wherever you want. We recommend starting with GitHub pages for ease of setup. All the computation is done via CI, that means that you can host your widget registry in an static site hosting like GitHub Pages (free!), AWS S3, your own server, etc.

### How does it work?
The [compiler](https://github.com/js-widgets/js-widgets/tree/master/packages/js-widgets-compiler#readme) will:
  1. Inspect all the JS apps (aka widgets) registered in `/metadata/registry.json`.
  1. Download the tarball of every application for the specified version.
  1. Execute `npm install && npm run-script build` on the downloaded applications.
  1. Place all the application bundles in a new folder called `/dist`.
  1. Compute some additional needed metadata and store it in `/dist/registry.json`.

From there you decide where to upload the contents of `/dist`.

## Upload the registry
Once everything is compiled, you will need to upload the generated files to a server of you choice (read some suggestions further below). The `/dist/registry.json` will contain all the info your CMS will need to embed the JS app.

For instance, I can have GitHub Actions upload it to my personal server after finishing compilation. It could end up in https://static.mateuaguilo.com/widgets/registry.json. This URL is all your CMS needs to discover all the available apps and allow you to embed them anywhere.

## Widget Registry boilerplate
Our recommendation is to fork [this project](https://github.com/js-widgets/widget-registry-boilerplate) and start from there. The Widget Registry boilerplate contains:
  - CI processes (using GitHub Actions) that compile the registry after changing `/metadata/registry.json` on the `main` branch.
  - CI processes (using GitHub Actions) that upload the resulting registry into [GitHub Pages](https://pages.github.com) to make it available to Drupal, Wordpress, SquareSpace, static HTML, etc.
  - Configuration management, so you can have a _sandbox_ environment to do your tests.

## Register a front-end JavaScript application
The only input in the Widget Registry is the `/metadata/registry.json`. This contains an array of objets. Each object has the necessary metadata to compile a widget:

  1. The `shortcode` or machine name of the widget. This is the widget identifier.
  1. The `version` that needs to be published. Once the widget has been published for the first time, it is likely that this is the only parameter that needs to be tweaked (via a Pull Request to your own widget registry project) to publish a new release of the JS app.
  1. The `repositoryUrl` or `tarballUrl`. If you are hosting your JS app in GitHub and you are using [GitHub Releases](https://developer.github.com/v3/repos/releases) you can set `repositoryUrl` and be done. The compiler will know how to locate and download your application's `.tar.gz` tarball. If you are hosting your application releases differently, you will need to use the `tarballUrl` property to specify where to download the `.tar.gz` for this version of your application.

### If you have your JS app releases in another place
The `tarballUrl` has you covered, but you might want to automate the computation of the tarballUrl. If you want to provide support for other technologies (GitLab releases, particular naming conventions, etc.) you can write a plugin [like](https://github.com/js-widgets/js-widgets/tree/master/packages/js-widgets-ingestion-gh-releases) [these](https://github.com/js-widgets/js-widgets/tree/master/packages/js-widgets-ingestion-tarball).

You will need to determine a new property (ex: `gitlabRepo`) and implement the logic to determine the URL to the tarball.

You can keep these plugins to yourself, but if you think it can benefit others we encourage you to [contribute](https://github.com/js-widgets/js-widgets/blob/master/CONTRIBUTE.md) it!

## Examples
Check the [Widget Registry Boilerplate](https://github.com/js-widgets/widget-registry-boilerplate) and the [Example Widget](https://github.com/js-widgets/example-widget). With a for loop and a few clicks you can have a quick demo up to test in your Drupal site.

The integration with Drupal is provided by:
  - [Widget Instance](https://www.drupal.org/project/widget_instance) module. This will allow you to render the JS application anywhere you can use a content entity (rendered as an entity reference, as a block, ...).
  - [Widget Ingestion](https://www.drupal.org/project/widget_ingestion) module. This will periodically check for new widgets and new versions using the widget registry URL (ex: [this one](https://static.mateuaguilo.com/widgets/registry.json)).
