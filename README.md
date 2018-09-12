<img src="resources/img/lazyfox-icon.png" height=80px>
# LazyFox plugin for Craft CMS 3.x

A plugin that makes lazy loading your images a breeze.

![Screenshot](resources/img/lazyfox-screencap.gif)

## Key features

- lazy load images to make web pages more responsive and fluid
- **source-sets**: LazyFox generates a bunch of different sizes of your images and makes the browser load only the image with needed size, avoiding the download of images that are bigger than what the viewport can render, resulting in faster load-time 
- displaying awesome placeholders that are embeded into the HTML code while image loads
- easy to use API that is native to Craft and Twig
- uses the latest and greatest HTML5 and JS APIs such as MutationObserver, ResizeObserver and Intersection API. Has polyfills included.
- lightweight: 7kB JavaScript, 1kB CSS

With LazyFox document jumping is a thing of the past!

## Requirements

This plugin requires Craft CMS 3.0.0-beta.23 or later.

## Installation

It's recommended to install LazyFox from the Craft plugin store.

If you want to install it manually however, follow these instructions.

1. Open your terminal and go to your Craft project:

        cd /path/to/project

2. Then tell Composer to load the plugin:

        composer require janhuenermann/lazyfox

3. In the Control Panel, go to Settings → Plugins and click the “Install” button for lazyfox.

## Configuring lazyfox

-Insert text here-

## Using lazyfox


## Code output

After the image has been loaded by LazyFox the resulting HTML structure will look something like the following.

```html 
<picture class="lazyfox --no-progress --transition --pixelated">
    <img 
    	sizes="480px" 
    	srcset="/images/_900x800_crop_center-center_none/a.jpg 900w, /images/_1800x1600_crop_center-center_none/a.jpg 1800w" 
    	src="/images/_1800x1600_crop_center-center_none/a.jpg">
</picture>
```

As you can see it produces a HTML5 picture element. The underlying img's `sizes` attribute in this case is automatically set by LazyFox in order to load the best fitting image.

## Styling lazy-loaded images in CSS
