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

    public function getSourceSet($settings, int $size) {
        $sizes = $settings->sourceSet;
        $arr = [];

        for ($i=0; $i < count($sizes); $i++) { 
            $row = $sizes[$i];

            if (empty($row['size'])) 
                continue;

            if (substr($row['size'], -1) !== '%')
                continue;

            $percentage = intval(substr($row['size'], 0, -1));
            $srcsize = ceil($size * $percentage / 100);

            if ($row['minSize'] <= $srcsize)
                $arr[] = $srcsize;
        }

        return $arr;
    }


    public function image(Asset $asset, $sources = [], $transform = NULL) {
        $settings = \janhuenermann\lazyfox\Lazyfox::getInstance()->settings;
        $previewType = $settings->previewType;
        $previewSize = $settings->previewSize;

        $w = $asset->getWidth($transform);
        $h = $asset->getHeight($transform);

        $padding = $h / $w * 100;
        $placeholder = $this->getBase64Placeholder($asset, $transform, $previewSize);
        $src = $asset->getUrl($transform);

        $sizes = $this->getSourceSet($settings, max($w, $h));
        $srcset = $this->produceSourceSet($sizes, $asset, $transform);
        

        $classes = " --no-progress --transition --sized --$previewType";

        echo 
           '<picture class="lazyfox --not-loaded' . $classes . '">
                <div style="padding-bottom: ' . $padding . '%" class=--sizer></div>
                <source src="' . $placeholder . '" class=--placeholder>
                <img data-sizes="auto" data-srcset="' . $srcset . '" data-src="' .  $src . '">
                <noscript><img srcset="' . $srcset . '" src="' . $src . '"></noscript>
            </picture>';

        Craft::$app->view->registerAssetBundle(LazyfoxAsset::class);
    }


    public function getBase64Placeholder(Asset $asset, $transform, $previewSize = 16) {
        $transform = $this->getScaledDownTransform($transform, $previewSize);
        $file = $asset->volume->rootPath . '/' . $this->getTransformFile($asset, $transform);
        $binary = file_get_contents($file);
        // Return as base64 string
        return sprintf('data:image/%s;base64,%s', $asset->getExtension(), base64_encode($binary));
    }

    public function produceSourceSet(array $srcset, Asset $asset, $transform) {
        $attr = [];

        foreach ($srcset as $size) {
            $t = $this->getScaledDownTransform($transform, ceil($size));
            $url = $asset->getUrl($t);
            $attr[] = $url . ' ' . $size . 'w';
        }

        return implode(', ', $attr);
    }

    public function getScaledDownTransform($transform, int $size) {
        if ($transform == NULL) {
            $transform = new AssetTransform();
            $transform->mode = 'fit';
            $transform->quality = 100;
        }
        else {
            $assetTransforms = Craft::$app->getAssetTransforms();
            $transform = $assetTransforms->normalizeTransform($transform);
        }

        $transform->format = 'jpg';

        if ($transform->mode == 'fit') {
            $transform->width = $size;
        }
        else {
            $w = $transform->width ?? $transform->height;
            $h = $transform->height ?? $transform->width;
            $ratio = $w / $h;
            
            if ($ratio > 1) {
                $transform->width = $size;
                $transform->height = ceil($size / $ratio);
            }
            else {
                $transform->height = $size;
                $transform->width = ceil($size * $ratio);
            }
        }

        return $transform;
    }

    public function getTransformFile(Asset $asset, $transform) {
        // Get the transform index model
        $assetTransforms = Craft::$app->getAssetTransforms();
        $index = $assetTransforms->getTransformIndex($asset, $transform);
        $assetTransforms->ensureTransformUrlByIndexModel($index);

        return $assetTransforms->getTransformSubpath($asset, $index);
    }

}
