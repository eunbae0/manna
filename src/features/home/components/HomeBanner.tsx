import Carousel from 'react-native-reanimated-carousel';
import { useWindowDimensions, View } from 'react-native';
import { useState } from 'react';
import { HomeBannerItem } from './HomeBannerItem';
import { Text } from '@/shared/components/text';
import {
	BANNER_DATA,
	HOME_BANNER_AUTO_PLAY_INTERVAL,
} from '../constants/homeBanner';

export function HomeBanner() {
	const { width } = useWindowDimensions();
	const [activeIndex, setActiveIndex] = useState(0);

	return (
		<View className="relative">
			<Carousel
				width={width}
				height={80}
				data={BANNER_DATA}
				onSnapToItem={(index) => setActiveIndex(index)}
				autoPlay={BANNER_DATA.length > 1}
				autoPlayInterval={HOME_BANNER_AUTO_PLAY_INTERVAL}
				renderItem={({ item }) => (
					<HomeBannerItem
						title={item.title}
						description={item.description}
						lottieView={item.lottieView}
						onPress={item.onPress}
					/>
				)}
			/>
			<View className="absolute bottom-3 right-7 bg-black opacity-30 rounded-full px-[6px] py-px">
				<Text size="xs" className="text-typography-0">
					{activeIndex + 1} / {BANNER_DATA.length}
				</Text>
			</View>
		</View>
	);
}
