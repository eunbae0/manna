import type { ClientUser } from '@/api/messaging/types';
import {
	Identify,
	identify,
	setUserId as amplitudeSetUserId,
	reset,
	track,
} from '@amplitude/analytics-react-native';
import {
	AmplitudeSymbol,
	AmplitudeScreen,
	AmplitudeLocation,
	AmplitudeEventType,
} from '../constants/amplitude';

export const setUserId = (userId: string) => {
	amplitudeSetUserId(userId);
};

export const identifyUser = (user: ClientUser) => {
	const identifyObj = new Identify();
	if (user.displayName) {
		identifyObj.set('displayName', user.displayName);
	}
	if (user.email) {
		identifyObj.set('email', user.email);
	}
	if (user.authType) {
		identifyObj.set('accountType', user.authType);
	}
	identify(identifyObj);
};

export const onUserSignIn = (user: ClientUser | null) => {
	if (!user) return;
	setUserId(user.id);
	identifyUser(user);
};

export const onUserSignOut = () => {
	const identifyObj = new Identify();
	identifyObj.clearAll();
	amplitudeSetUserId('');
	identify(identifyObj);
	reset();
};

export const trackAmplitudeEvent = (
	eventName: string,
	{
		symbol,
		screen,
		location,
		eventType,
		...rest
	}: {
		symbol?: keyof typeof AmplitudeSymbol;
		screen?: keyof typeof AmplitudeScreen;
		location?: keyof typeof AmplitudeLocation;
		eventType?: keyof typeof AmplitudeEventType;
	} & Record<string, unknown>,
) => {
	const properties: Record<string, unknown> = { ...rest };
	if (symbol) {
		properties.symbol = AmplitudeSymbol[symbol];
	}
	if (screen) {
		properties.screen = AmplitudeScreen[screen];
	}
	if (location) {
		properties.location = AmplitudeLocation[location];
	}
	if (eventType) {
		properties.eventType = AmplitudeEventType[eventType];
	}

	properties.isDevelopment = __DEV__;

	track(eventName, properties);
};
