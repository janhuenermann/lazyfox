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

    public function image(Asset $asset, string $type) {
        echo '<img class="lazyfox --not-loaded" data-src="' .  $asset->getUrl() . '" src="' . $this->getBase64($asset) . '" width="' . $asset->width . '" height="' . $asset->height . '">';
        Craft::$app->view->registerAssetBundle(LazyfoxAsset::class);
    }

    public function getTransformFile(Asset $asset, $transform) {
        // Get the transform index model
        $assetTransforms = Craft::$app->getAssetTransforms();
        $index = $assetTransforms->getTransformIndex($asset, $transform);
        $assetTransforms->ensureTransformUrlByIndexModel($index);

        return $assetTransforms->getTransformSubpath($asset, $index);
    }

    public function getBase64(Asset $asset) {
        $thumb = [
            'mode' => 'fit',
            'width' => 16,
            'quality' => 100,
            'format' => 'jpg'
        ];

        $file = $asset->volume->rootPath . '/' . $this->getTransformFile($asset, $thumb);
        $binary = file_get_contents($file);
        // Return the string.
        return sprintf('data:image/%s;base64,%s', $asset->getExtension(), base64_encode($binary));
    }

}
