# ![extension ownership monitor logo](/other_assets/logo-32.png) extension ownership monitor

**Detect when your extensions have changed owners**

Intermittently checks your installed extensions to see if the developer information listed on AMO ([addons.mozilla.org](https://addons.mozilla.org)) has changed. If anything is different, the extension icon will display a red badge, alerting you to the change.

Forked from [Under New Management](https://github.com/classvsoftware/under-new-management) (created by [Matt Frisbie](https://www.mattfriz.com/)), by [Max Perrello](https://max.bio).

Media (UNM):

- [Hacker News discussion](https://news.ycombinator.com/item?id=39620060)
- [Featured in *tl;dr sec Newsletter*](https://tldrsec.com/p/tldr-sec-221)
- [Featured in *The Register*](https://www.theregister.com/2024/03/07/chrome_extension_changes/)

![under new management screenshot](/other_assets/unm-screenshot-1280x800.png)

## Why is this needed?

Extension developers are [constantly getting offers to buy their extensions](https://github.com/extesy/hoverzoom/discussions/670). In nearly every case, the people buying these extensions want to rip off the existing users.

**The users of these extensions have no idea an installed extension has changed hands, and may now be compromised.**

extension ownership monitor gives users notice of the change of ownership, giving them a chance to make an informed decision about the software they're using.

## Installation

Install here: https://addons.mozilla.org/en-US/firefox/addon/under-new-management/

OR

Download a [prebuilt release](https://github.com/maxtheaxe/under-new-management-firefox/releases), unpack the .zip file, and load the `dist` directory into Firefox.

## Building from source

**extension ownership monitor** uses WXT, React, Typescript, and TailwindCSS

`pnpm install` to install dependencies

`pnpm build:firefox` to build a release, then load the `manifest.json` in that directory as a temporary extension

## Does this rely on an external server?

[Unlike the original](https://github.com/classvsoftware/under-new-management/issues/3#issuecomment-1997085580), this one doesn't. It queries AMO directly and your data never goes anywhere else.

## Is this a copy of Under New Management?

It's a fork, and was the original port of the extension (UNM) on firefox. I decided to continue maintaining it for those who don't want to send their extension data to the owner's server. Big thanks to them for developing the original, but especially given that [they run a browser extension advertising network](https://www.extensionboost.com), I'd rather not take the risk.

You'll notice that [this fork originally used the `under-new-management` slug on AMO](https://archive.is/veeJD). That will be changing shortly, as I intend to hand it over to the maintainer of UNM.
