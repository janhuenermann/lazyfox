<?php

namespace janhuenermann\lazyfox\engine;

use janhuenermann\lazyfox\Lazyfox;
use craft\elements\Asset;
use craft\models\AssetTransform;

use Craft;

use aelvan\imager\models\CraftTransformedImageModel;
use aelvan\imager\Imager;

class LazyfoxEngine {

	public static function getBase64($asset, $transform) {
		if ($asset instanceof Asset) {
			$path = static::getImagePath($asset, $transform);
	        $binary = file_get_contents($path);
	        // Return as base64 string
	        return sprintf('data:image/%s;base64,%s', $asset->getExtension(), base64_encode($binary));
		}

		else if ($asset instanceof CraftTransformedImageModel) {
			return $asset->getBase64Encoded();
		}

		throw new \Exception("Invalid asset provided: $asset");
    }


    public static function produceSourceSet(array $srcset, Asset $asset, $transform) {
    	$imager = Imager::getInstance()->imager;
        $attr = [];

        foreach ($srcset as $size) {
        	$a = $imager->transformImage($asset, [ 'width' => $size, 'format' => 'jpg', 'interlace' => 'partition' ]);
            // $t = static::getScaledDownTransform($transform, ceil($size));
            $url = $a->getUrl();
            $attr[] = $url . ' ' . $size . 'w';
        }

        return implode(', ', $attr);
    }

    public static function getScaledDownTransform($transform, int $size, $format = NULL) {
        if ($transform == NULL) {
            $transform = new AssetTransform();
            $transform->mode = 'fit';
            $transform->quality = 100;
            $transform->format = 'jpg';
        }
        else {
            $assetTransforms = Craft::$app->getAssetTransforms();
            $transform = $assetTransforms->normalizeTransform($transform);
        }

        if ($format !== NULL)
            $transform->format = $format;

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

    public static function getImagePath(Asset $asset, $transform) {
        // Get the transform index model
        $assetTransforms = Craft::$app->getAssetTransforms();
        $index = $assetTransforms->getTransformIndex($asset, $transform);
        // generate image if necessary
        $assetTransforms->ensureTransformUrlByIndexModel($index);

        return $asset->volume->rootPath . '/' . $assetTransforms->getTransformSubpath($asset, $index);
    }

    public static function getSourceSet($settings, int $size) {
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

}