<?php
/**
 * Revision Slider MediaWiki Extension
 */

$wgAutoloadClasses['RevisionSliderHooks'] = __DIR__ . '/RevisionSlider.hooks.php';
$wgHooks['BeforePageDisplay'][] = 'RevisionSliderHooks::onBeforePageDisplay';

$wgResourceModules['ext.RevisionSlider.init'] = [
	'scripts' => [
		'modules/ext.RevisionSlider.init.js',
	],
	'styles' => [
		'modules/ext.RevisionSlider.css',
	],
	'dependencies' => [
		'ext.RevisionSlider.rainbow',
		'ext.RevisionSlider.fetchRevisions',
	],

	'localBasePath' => __DIR__,
];

$wgResourceModules['ext.RevisionSlider.rainbow'] = [
	'scripts' => [
		'modules/ext.RevisionSlider.rainbow.js',
	],
	'localBasePath' => __DIR__,
];

$wgResourceModules['ext.RevisionSlider.fetchRevisions'] = [
	'scripts' => [
		'modules/ext.RevisionSlider.fetchRevisions.js',
	],
	'localBasePath' => __DIR__,
];
