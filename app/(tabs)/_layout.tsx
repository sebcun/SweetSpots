import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";

import { useColorScheme } from "@/components/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Map</Label>
        <Icon sf="map.fill" drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="nearme">
        <Label>Near Me</Label>
        <Icon sf="location.circle.fill" drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="about">
        <Label>About</Label>
        <Icon sf="info.circle.fill" drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
