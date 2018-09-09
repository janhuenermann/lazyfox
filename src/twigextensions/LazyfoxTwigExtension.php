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
        ];
    }

    public function image(Asset $asset, $transform = NULL) {
        $w = $asset->getWidth($transform);
        $h = $asset->getHeight($transform);

        $srcset = $this->produceSourceSet([$w / 2, $w * 3 / 4, $w], $asset, $transform);

        echo 
           '<figure class="lazyfox --not-loaded">
                <div class=lazyfox-placeholder style="padding-bottom: ' . ($h / $w * 100) . '%"></div>
                <img data-srcset="' . $srcset . '" data-src="' .  $asset->getUrl($transform) . '" src="' . $this->getBase64($asset, $transform) . '">
            </figure>';

        Craft::$app->view->registerAssetBundle(LazyfoxAsset::class);
    }

    public function getBase64(Asset $asset, $transform) {
        $transform = $this->getScaledDownTransform($transform, 16);
        $file = $asset->volume->rootPath . '/' . $this->getTransformFile($asset, $transform);
        $binary = file_get_contents($file);
        // Return as base64 string
        return sprintf('data:image/%s;base64,%s', $asset->getExtension(), base64_encode($binary));
    }

    public function produceSourceSet(array $srcset, Asset $asset, $transform) {
        $attr = [];

        foreach ($srcset as $size) {
            $t = $this->getScaledDownTransform($transform, $size);
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
                $transform->height = $size / $ratio;
            }
            else {
                $transform->height = $size;
                $transform->width = $size * $ratio;
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
