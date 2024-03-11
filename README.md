![Under New Management](src/logo128.png)

# Under New Management

**Detect when your extensions have changed owners**

Intermittenty checks your installed extensions to see if the developer information listed on AMO ([addons.mozilla.org](https://addons.mozilla.org)) has changed. If anything is different, the extension icon will display a red badge, alerting you to the change.

Created by [Matt Frisbie](https://www.mattfriz.com/), modified for Firefox by [Max Perrello](https://max.bio)

Media:

- [Hacker News discussion](https://news.ycombinator.com/item?id=39620060)
- [Featured in *tl;dr sec Newsletter*](https://tldrsec.com/p/tldr-sec-221)
- [Featured in *The Register*](https://www.theregister.com/2024/03/07/chrome_extension_changes/)

![image](unm-screenshot-1280x800.png)

## Why is this needed?

Extension developers are [constantly getting offers to buy their extensions](https://github.com/extesy/hoverzoom/discussions/670). In nearly every case, the people buying these extensions want to rip off the existing users.

**The users of these extensions have no idea an installed extension has changed hands, and may now be compromised.**

Under New Management gives users notice of the change of ownership, giving them a chance to make an informed decision about the software they're using.

## Installation

Install here: https://addons.mozilla.org/en-US/firefox/addon/under-new-management/

OR

Download a [prebuilt release](https://github.com/maxtheaxe/under-new-management-firefox/releases), unpack the .zip file, and load the `dist` directory into Firefox.

## Building from source

**Under New Management** uses Parcel, React, Typescript, and TailwindCSS

`npm install` to install dependencies

`npm run start` to run locally

`npm run build` to build a release

## Why does this need an external server?

It doesn't. It queries AMO directly and your data never goes anywhere else.
