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

    public function image(Asset $asset, array $transform = NULL) {
        if ($transform == NULL)
            $transform = $asset->_transform;

        echo 
           '<figure class="lazyfox --not-loaded">
                <div class=lazyfox-placeholder style="padding-bottom: ' . ($asset->height / $asset->width * 100) . '%">
                </div>
                <img data-src="' .  $asset->getUrl() . '" src="' . $this->getBase64($asset, $transform) . '">
            </figure>';

        Craft::$app->view->registerAssetBundle(LazyfoxAsset::class);
    }

    public function getBase64(Asset $asset, array $transform) {
        $transform = $this->getScaledDownTransform($asset, $transform);
        $file = $asset->volume->rootPath . '/' . $this->getTransformFile($asset, $transform);
        $binary = file_get_contents($file);
        // Return as base64 string
        return sprintf('data:image/%s;base64,%s', $asset->getExtension(), base64_encode($binary));
    }

    public function getScaledDownTransform(Asset $asset, array $_transform, int $size) {
        if ($_transform == NULL) {
            $_transform = [
                'mode' => 'fit'
            ];
        }

        if ($_transform['mode'] == 'fit') {
            $_transform['width'] = $size;
        }
        else {
            $w = $_transform['width'] ?? $_transform['height'];
            $h = $_transform['height'] ?? $_transform['width'];
            $ratio = $w / $h;
            
            if ($ratio > 1) {
                $_transform['width'] = $size;
                $_transform['height'] = $size / $ratio;
            }
            else {
                $_transform['height'] = $size;
                $_transform['width'] = $size * $ratio;
            }
        }

        $_transform['quality'] = 70;
        $_transform['format'] = 'jpg';

        return $_transform;
    }

    public function getTransformFile(Asset $asset, $transform) {
        // Get the transform index model
        $assetTransforms = Craft::$app->getAssetTransforms();
        $index = $assetTransforms->getTransformIndex($asset, $transform);
        $assetTransforms->ensureTransformUrlByIndexModel($index);

        return $assetTransforms->getTransformSubpath($asset, $index);
    }

}
