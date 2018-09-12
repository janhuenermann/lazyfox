<?php
/**
 * lazyfox plugin for Craft CMS 3.x
 *
 * A plugin that makes lazy loading your images a breeze.
 *
 * @link      janhuenermann.com
 * @copyright Copyright (c) 2018 Jan Hünermann
 */

namespace janhuenermann\lazyfox\twigextensions;

use janhuenermann\lazyfox\Lazyfox;
use janhuenermann\lazyfox\assetbundles\Lazyfox\LazyfoxAsset;
use janhuenermann\lazyfox\engine\LazyfoxEngine;
use craft\elements\Asset;
use craft\models\AssetTransform;

use Craft;

/**
 * Twig can be extended in many ways; you can add extra tags, filters, tests, operators,
 * global variables, and functions. You can even extend the parser itself with
 * node visitors.
 *
 * http://twig.sensiolabs.org/doc/advanced.html
 *
 * @author    Jan Hünermann
 * @package   Lazyfox
 * @since     0.0.1
 */
class LazyfoxTwigExtension extends \Twig_Extension
{
    // Public Methods
    // =========================================================================

    /**
     * Returns the name of the extension.
     *
     * @return string The extension name
     */
    public function getName()
    {
        return 'LazyFox';
    }

    /**
     * Returns an array of Twig filters, used in Twig templates via:
     *
     *      {{ 'something' | someFilter }}
     *
     * @return array
     */
    public function getFilters()
    {
        return [];
    }

    /**
     * Returns an array of Twig functions, used in Twig templates via:
     *
     *      {% set this = someFunction('something') %}
     *
    * @return array
     */
    public function getFunctions() {
        return [
            new \Twig_SimpleFunction('image', [$this, 'image']),
            new \Twig_SimpleFunction('placeholder', [$this, 'placeholder'])
        ];
    }
    


    public function image(Asset $asset, $transform = NULL) {
        $settings = \janhuenermann\lazyfox\Lazyfox::getInstance()->settings;
        $previewType = $settings->previewType;
        $previewSize = $settings->previewSize;

        $w = $asset->getWidth($transform);
        $h = $asset->getHeight($transform);

        $padding = $h / $w * 100;
        $preview = LazyfoxEngine::getScaledDownTransform($transform, $previewSize, "png");

        $placeholder = LazyfoxEngine::getBase64($asset, $preview);
        $src = $asset->getUrl($transform);

        $sizes = LazyfoxEngine::getSourceSet($settings, max($w, $h));
        $srcset = LazyfoxEngine::produceSourceSet($sizes, $asset, $transform);

        $classes = " --no-progress --transition --sized --$previewType";

        echo 
           '<picture class="lazyfox --not-loaded' . $classes . '" data-type="' . $previewType . '">
                <div style="padding-bottom: ' . $padding . '%" class=--sizer></div>
                <img src="' . $placeholder . '" class=--placeholder>
                <img data-sizes="auto" data-srcset="' . $srcset . '" data-src="' .  $src . '">
                <noscript><img srcset="' . $srcset . '" src="' . $src . '"></noscript>
            </picture>';

        Craft::$app->view->registerAssetBundle(LazyfoxAsset::class);
    }




}