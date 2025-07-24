const IS_DEVELOPMENT = process.env.APP_VARIANT === 'development';

export default {
	expo: {
		name: IS_DEVELOPMENT ? '만나 (개발)' : '만나',
		displayName: IS_DEVELOPMENT ? '만나 (개발)' : '만나',
		slug: 'manna',
		scheme: ['manna'],
		version: '1.3.2',
		orientation: 'portrait',
		icon: './assets/images/icons/manna_icon_white.png',
		userInterfaceStyle: 'automatic',
		newArchEnabled: true,
		ios: {
			associatedDomains: [
				'applinks:so-group.firebaseapp.com',
				'applinks:manna-app.onelink.me',
			],
			supportsTablet: true,
			bundleIdentifier: IS_DEVELOPMENT
				? 'com.eunbae.sogroup.development'
				: 'com.eunbae.sogroup',
			infoPlist: {
				ITSAppUsesNonExemptEncryption: false,
				CADisableMinimumFrameDurationOnPhone: true,
				UIBackgroundModes: ['remote-notification'],
				CFBundleDisplayName: IS_DEVELOPMENT ? '만나 (개발)' : '만나',
				CFBundleVersion: '1.3.2',
			},
			entitlements: {
				'com.apple.developer.applesignin': ['Default'],
				'aps-environment': 'production',
			},
			usesAppleSignIn: true,
			googleServicesFile: IS_DEVELOPMENT
				? './assets/google/development/GoogleService-Info.plist'
				: './assets/google/GoogleService-Info.plist',
			appleTeamId: 'AQ62DT56AM',
			version: '1.3.2',
		},
		android: {
			versionCode: 13200,
			adaptiveIcon: {
				foregroundImage: './assets/images/icons/manna_icon_android_white.png',
				backgroundColor: '#FFFFFF',
			},
			package: 'com.eunbae.sogroup',
			intentFilters: [
				{
					action: 'VIEW',
					data: [
						{
							scheme: 'https',
							host: 'manna-app.onelink.me',
							pathPrefix: '/1Wgq', // onelink template id
						},
					],
					category: ['BROWSABLE', 'DEFAULT'],
				},
				{
					action: 'VIEW',
					data: [
						{
							scheme: 'manna',
						},
					],
					category: ['BROWSABLE', 'DEFAULT'],
				},
			],
			googleServicesFile: './assets/google/google-services.json',
		},
		web: {
			bundler: 'metro',
			output: 'static',
		},
		plugins: [
			'expo-router',
			'expo-apple-authentication',
			[
				'expo-splash-screen',
				{
					image: './assets/images/icons/manna_icon_beige.png',
					imageWidth: 200,
					resizeMode: 'contain',
					backgroundColor: '#FEF8EF',
				},
			],
			[
				'@react-native-google-signin/google-signin',
				{
					iosUrlScheme:
						'com.googleusercontent.apps.892340902140-luknmdbkvedhndta0r65ajru5ltimfob',
				},
			],
			[
				'expo-image-picker',
				{
					photosPermission:
						'$(PRODUCT_NAME) 안에서 그룹원들과 프로필 이미지를 공유할 수 있도록 사진에 접근합니다.',
				},
			],
			'@react-native-firebase/app',
			'@react-native-firebase/auth',
			'@react-native-firebase/crashlytics',
			'@react-native-firebase/perf',
			[
				'expo-build-properties',
				{
					ios: {
						useFrameworks: 'static',
					},
				},
			],
			[
				'@sentry/react-native/expo',
				{
					organization: 'so-group',
					project: 'react-native',
				},
			],
			[
				'expo-dev-client',
				{
					addGeneratedScheme: !!IS_DEVELOPMENT,
				},
			],
			[
				'react-native-vision-camera',
				{
					cameraPermissionText:
						'$(PRODUCT_NAME)이 카메라에 접근할 수 있도록 허가해 주세요.',
					enableCodeScanner: true,
				},
			],
			[
				'expo-speech-recognition',
				{
					microphonePermission:
						'$(PRODUCT_NAME)이 마이크에 접근할 수 있도록 허가해 주세요.',
					speechRecognitionPermission:
						'$(PRODUCT_NAME)이 음성을 인식할 수 있도록 허가해 주세요.',
					androidSpeechServicePackages: [
						'com.google.android.googlequicksearchbox',
					],
				},
			],
			['expo-font'],
			['expo-web-browser'],
			[
				'react-native-appsflyer',
				{ shouldUseStrictMode: true }, // <<-- only for strict mode
			],
			[
				'react-native-share',
				{
					ios: ['fb', 'instagram', 'twitter', 'tiktoksharesdk'],
					android: [
						'com.facebook.katana',
						'com.instagram.android',
						'com.twitter.android',
						'com.zhiliaoapp.musically',
					],
				},
			],
		],
		experiments: {
			typedRoutes: true,
		},
		extra: {
			router: {
				origin: false,
			},
			eas: {
				projectId: '51171585-bdaa-4cf9-ba68-b03a6e850062',
			},
		},
		owner: 'eunbae',
	},
};
