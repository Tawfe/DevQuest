#ifndef DevQuest_Bridging_Header_h
#define DevQuest_Bridging_Header_h

// Exposes react-native-app-auth ObjC protocols
// (RNAppAuthAuthorizationFlowManager + its delegate) to AppDelegate.swift.
// Required because the pod builds as a static library without use_frameworks!.
// The pod has no custom header_dir, so its public headers live under
// Pods/Headers/Public/react-native-app-auth/.
#import <react-native-app-auth/RNAppAuthAuthorizationFlowManager.h>

#endif
