import { ScrollView, Text } from 'react-native';

export const MarqueeText = ({ text, style }: { text: string; style: any }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      bounces={false}
    >
      <Text style={style} numberOfLines={1}>
        {text}
      </Text>
    </ScrollView>
  );
};
