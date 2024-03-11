import {registerPlugin} from "@capacitor/core";

let TwobidSDKPlugin: ITwobidSDK;

export enum ConvertPrice {
  KEEP_AS_IS = "keep_as_is",
  WEEKS = "weeks",
  MONTHS = "months"
}

export class AppVersionData {
  versionCode?: number;
  versionName?: string;
  hdataHash?: string;
  hdataVersion?: string;
  twobidSdkVersion?: string;
}

export class TwobidSDKProxy implements ITwobidSDK {
  htmlAdViews: HTMLHtmlElement[] = [];

  constructor() {
    this.billingRegisterPurchaseStateChange(async (state) => {
      this.updateAdViewsVisibility(state);
    }).then();
  }

  // analytics
  analyticsSetUserId(args: { userId: string }): void {
    TwobidSDKPlugin.analyticsSetUserId(args);
  }

  analyticsLogEvent(args: { event: string, bundle?: object }): void {
    TwobidSDKPlugin.analyticsLogEvent(args);
  }

  analyticsLogScreen(args: { screen: string }): void {
    TwobidSDKPlugin.analyticsLogScreen(args);
  }

  analyticsLogRevenue(args: { amount: number, currency: string, name: string, productId: string }): void {
    TwobidSDKPlugin.analyticsLogRevenue(args);
  }

  // ads
  adsRegisterAdView(args: { viewId: string }): void {
    TwobidSDKPlugin.adsRegisterAdView(args);
  }

  registerHtmlAdView(view: HTMLHtmlElement) {
    if (!view) {
      console.log("Attempted to register undefined HTML adview");
      return;
    }

    this.htmlAdViews.push(view);
  };

  async updateAdViewsVisibility(result: PurchaseStateChangeResult) {
    console.log("TwobidSDK::updateAdViewsVisibility " + JSON.stringify(result));

    let hasPremium = await this.adsNoAds();

    for (let view of this.htmlAdViews) {
      if (view && view.style)
        view.style.visibility = hasPremium ? "hidden" : "visible";
    }

    return Promise.resolve(undefined)
  }

  adsInsertBannerAdInto(args: { placement: string; viewId: string }): void {
    TwobidSDKPlugin.adsInsertBannerAdInto(args);
  }

  adsShowInterstitial(args: { placement: string; adSource?: AdSource }): Promise<void> {
    return TwobidSDKPlugin.adsShowInterstitial(args);
  }

  adsShowInterstitialIfNoPremium(args: { placement: string; adSource?: AdSource }): Promise<void> {
    return TwobidSDKPlugin.adsShowInterstitialIfNoPremium(args);
  }

  adsShowRewardedVideo(args: { placement: string }, callback: (result: {
    type: string,
    amount: number
  }) => void): Promise<void> {
    return TwobidSDKPlugin.adsShowRewardedVideo(args, callback);
  }

  adsShowExitAdDialog(args: { placement: string }, callback: (result: {canceled: boolean}) => void): Promise<void> {
    return TwobidSDKPlugin.adsShowExitAdDialog(args, callback);
  }

  async adsNoAds(): Promise<boolean> {
    return (await this.adsNoAdsInternal()).result;
  }

  adsNoAdsInternal(): Promise<{ result: boolean }> {
    return TwobidSDKPlugin.adsNoAdsInternal();
  }

  // billing
  billingGetDefaultProductPrice(args: { productName: string, convertPrice: ConvertPrice }): Promise<string> {
    return TwobidSDKPlugin.billingGetDefaultProductPrice(args);
  }

  billingPurchaseConsumable(args: { purchaseId: string; productNames: string[] }, callback: PurchaseCallback): void {
    TwobidSDKPlugin.billingPurchaseConsumable(args, callback);
  }

  billingPurchaseSubscription(args: {
    purchaseId: string;
    productName: string;
    offerId?: string | null
  }, callback: PurchaseCallback): void {
    TwobidSDKPlugin.billingPurchaseSubscription(args, callback);
  }

  billingGetPurchases(): Promise<{ purchases: Purchase[] }> {
    return TwobidSDKPlugin.billingGetPurchases();
  }

  billingRegisterPurchaseStateChange(callback: PurchaseStateChangeCallback): Promise<string> {
    return TwobidSDKPlugin.billingRegisterPurchaseStateChange(callback);
  }

  billingUnregisterPurchaseStateChange(options: { callbackId: string }): Promise<void> {
    return TwobidSDKPlugin.billingUnregisterPurchaseStateChange(options);
  }

  // consent
  requestConsent(): Promise<{ hasConsent: boolean }> {
    return TwobidSDKPlugin.requestConsent();
  }

  changeConsent(): Promise<{ hasConsent: boolean }> {
    return TwobidSDKPlugin.changeConsent();
  }

  // personalization
  personalizationGetBoolean(args: { key: string; defaultValue: boolean }): Promise<boolean> {
    return TwobidSDKPlugin.personalizationGetBoolean(args);
  }

  personalizationGetDouble(args: { key: string; defaultValue: number }): Promise<number> {
    return TwobidSDKPlugin.personalizationGetDouble(args);
  }

  personalizationGetInt(args: { key: string; defaultValue: number }): Promise<number> {
    return TwobidSDKPlugin.personalizationGetInt(args);
  }

  personalizationGetLong(args: { key: string; defaultValue: number }): Promise<number> {
    return TwobidSDKPlugin.personalizationGetLong(args);
  }

  personalizationGetString(args: { key: string; defaultValue: string }): Promise<string> {
    return TwobidSDKPlugin.personalizationGetString(args);
  }

  // rating
  nativeRatingDialog(): void {
    TwobidSDKPlugin.nativeRatingDialog();
  }

  ratingDialog(args: { placementId: string, useDefaultCallback?: boolean }): Promise<{ result: boolean }> {
    return TwobidSDKPlugin.ratingDialog(args);
  }

  // update
  updateRequest(): void {
    TwobidSDKPlugin.updateRequest();
  }

  // internal stuff

  version(): Promise<AppVersionData> {
    return TwobidSDKPlugin.version();
  }
}

export enum AdSource {
  ADMOB = 1,
  TWOBID = 2,
  ANY = ADMOB | TWOBID
}

export enum PurchaseState {
  FAILED = "failed",
  CANCELED = "canceled",
  COMPLETE = "complete",
  ALREADY_OWNED = "already_owned"
}

export enum PurchaseStateChange {
  INITIALIZED = "initialized",
  UPDATED = "updated",
  COMPLETE = "complete"
}

export class PurchaseStateChangeResult {
  state?: PurchaseStateChange;
}

export class LineItem {
  type?: string;
  name?: string;
  skuId?: string;
  premium: boolean = false;
}

export class Purchase {
  purchaseId?: string;
  twobidId?: string;
  lineItems: LineItem[] = [];
}

export class PurchaseResult {
  result?: {
    state?: PurchaseState;
    purchaseId?: string;
  }
}

export type PurchaseCallback = (result: PurchaseResult) => void;

export type PurchaseStateChangeCallback = (state: PurchaseStateChangeResult) => void;

export interface ITwobidSDK {
  // analytics
  analyticsSetUserId(args: { userId: string }): void;

  analyticsLogEvent(args: { event: string, bundle?: object }): void;

  analyticsLogScreen(args: { screen: string }): void;

  analyticsLogRevenue(args: { amount: number, currency: string, name: string, productId: string }): void;

  // ads
  adsRegisterAdView(args: { viewId: string }): void;

  adsInsertBannerAdInto(args: { placement: string, viewId: string }): void;

  adsShowInterstitial(args: { placement: string, adSource?: AdSource }): Promise<void>;

  adsShowInterstitialIfNoPremium(args: { placement: string, adSource?: AdSource }): Promise<void>;

  adsShowRewardedVideo(args: { placement: string }, callback: (result: {
    type: string,
    amount: number
  }) => void): Promise<void>;

  adsShowExitAdDialog(args: { placement: string }, callback: (result: {canceled: boolean}) => void): Promise<void>;

  // billing
  billingGetDefaultProductPrice(args: { productName: string, convertPrice: ConvertPrice }): Promise<string>;

  billingPurchaseConsumable(args: { purchaseId: string, productNames: string[] }, callback: PurchaseCallback): void;

  billingPurchaseSubscription(args: {
    purchaseId: string,
    productName: string,
    offerId?: string | null
  }, callback: PurchaseCallback): void;

  billingGetPurchases(): Promise<{ purchases: Purchase[] }>;

  billingRegisterPurchaseStateChange(callback: PurchaseStateChangeCallback): Promise<string>;

  billingUnregisterPurchaseStateChange(options: { callbackId: string }): Promise<void>;

  adsNoAdsInternal(): Promise<{ result: boolean }>;

  adsNoAds(): Promise<boolean>;

  // consent
  requestConsent(): Promise<{ hasConsent: boolean }>;

  changeConsent(): Promise<{ hasConsent: boolean }>;

  // personalization
  personalizationGetString(args: { key: string, defaultValue: string }): Promise<string>;

  personalizationGetLong(args: { key: string, defaultValue: number }): Promise<number>;

  personalizationGetInt(args: { key: string, defaultValue: number }): Promise<number>;

  personalizationGetBoolean(args: { key: string, defaultValue: boolean }): Promise<boolean>;

  personalizationGetDouble(args: { key: string, defaultValue: number }): Promise<number>;

  // rating
  nativeRatingDialog(): void;

  ratingDialog(args: { placementId: string, useDefaultCallback?: boolean }): Promise<{ result: boolean }>

  // update
  updateRequest(): void;

  // internal stuff

  version(): Promise<AppVersionData>;
}

export class TwobidSDKDummy implements ITwobidSDK {
  // analytics
  analyticsSetUserId(args: { userId: string }): void {
    console.log("TwobidSDK::analyticsSetUserId ", args);
  }

  analyticsLogEvent(args: { event: string, bundle?: object }): void {
    console.log("TwobidSDK::analyticsLogEvent ", args);
  }

  analyticsLogScreen(args: { screen: string }): void {
    console.log("TwobidSDK::analyticsLogScreen ", args);
  }

  analyticsLogRevenue(args: { amount: number, currency: string, name: string, productId: string }): void {
    console.log("TwobidSDK::analyticsLogRevenue ", args);
  }

  // ads
  adsRegisterAdView(args: { viewId: string }): void {
    console.log("TwobidSDK::registerAdView ", args.viewId);
  }

  adsInsertBannerAdInto(args: { placement: string; viewId: string }): void {
    console.log("TwobidSDK::insertBannerAdInto ", args);
  }

  adsShowInterstitial(args: { placement: string; adSource?: AdSource }): Promise<void> {
    console.log("TwobidSDK::showInterstitial ", args);
    return Promise.resolve(undefined);
  }

  adsShowInterstitialIfNoPremium(args: { placement: string; adSource?: AdSource }): Promise<void> {
    console.log("TwobidSDK::showInterstitialIfNoPremium ", args);
    return Promise.resolve(undefined);
  }

  adsShowRewardedVideo(args: { placement: string }, callback: (result: {
    type: string,
    amount: number
  }) => void): Promise<void> {
    console.log("TwobidSDK::showRewardedVideo ", args.placement);
    return Promise.resolve(undefined);
  }

  adsShowExitAdDialog(args: { placement: string }, callback: (result: {canceled: boolean}) => void): Promise<void> {
    console.log("TwobidSDK::adsShowExitAdDialog ", args.placement);
    return Promise.resolve(undefined);
  }

  // billing
  billingGetDefaultProductPrice(args: { productName: string, convertPrice: ConvertPrice }): Promise<string> {
    return Promise.resolve("N/A");
  }

  billingPurchaseConsumable(args: { purchaseId: string; productNames: string[] }, callback: PurchaseCallback): void {
    console.log("TwobidSDK::purchaseConsumable ", args);
  }

  billingPurchaseSubscription(args: {
    purchaseId: string;
    productName: string;
    offerId?: string | null
  }, callback: PurchaseCallback): void {
    console.log("TwobidSDK::purchaseSubscription", args);
  }

  billingGetPurchases(): Promise<{ purchases: Purchase[] }> {
    return Promise.resolve({purchases: []});
  }

  billingRegisterPurchaseStateChange(callback: PurchaseStateChangeCallback): Promise<string> {
    return Promise.resolve("");
  }

  billingUnregisterPurchaseStateChange(options: { callbackId: string }): Promise<void> {
    return Promise.resolve(undefined);
  }

  adsNoAdsInternal(): Promise<{ result: boolean }> {
    return Promise.resolve({result: false});
  }

  adsNoAds(): Promise<boolean> {
    return Promise.resolve(false);
  }

  // consent
  requestConsent(): Promise<{ hasConsent: boolean }> {
    console.log("TwobidSDK::requestConsent called");
    return Promise.resolve({hasConsent: true});
  }

  changeConsent(): Promise<{ hasConsent: boolean }> {
    console.log("TwobidSDK::changeConsent called");
    return Promise.resolve({hasConsent: true});
  }

  // personalization
  personalizationGetString(args: { key: string, defaultValue: string }): Promise<string> {
    console.log("TwobidSDK::personalizationGetString called");
    return Promise.resolve(args.defaultValue);
  }

  personalizationGetLong(args: { key: string, defaultValue: number }): Promise<number> {
    console.log("TwobidSDK::personalizationGetLong called");
    return Promise.resolve(args.defaultValue);
  }

  personalizationGetInt(args: { key: string, defaultValue: number }): Promise<number> {
    console.log("TwobidSDK::personalizationGetInt called");
    return Promise.resolve(args.defaultValue);
  }

  personalizationGetBoolean(args: { key: string, defaultValue: boolean }): Promise<boolean> {
    console.log("TwobidSDK::personalizationGetBoolean called");
    return Promise.resolve(args.defaultValue);
  }

  personalizationGetDouble(args: { key: string, defaultValue: number }): Promise<number> {
    console.log("TwobidSDK::personalizationGetDouble called");
    return Promise.resolve(args.defaultValue);
  }

  // rating
  nativeRatingDialog(): void {
    console.log("TwobidSDK::nativeRatingDialog called");
  }

  ratingDialog(args: { placementId: string, useDefaultCallback?: boolean }): Promise<{ result: boolean }> {
    console.log("TwobidSDK::ratingDialog called");
    return Promise.resolve({result: false});
  }

  // update
  updateRequest(): void {
    console.log("TwobidSDK::updateRequest called");
  }

  // internal stuff

  version(): Promise<AppVersionData> {
    return Promise.resolve({
      versionCode: 1,
      versionName: "1.0.0",
      hdataVersion: "randomhash-12345",
      twobidSdkVersion: "1.0.0"
    });
  }
}

TwobidSDKPlugin = registerPlugin<ITwobidSDK>(
  'TwobidSDK',
  {
    web: () => new TwobidSDKDummy()
  }
);
export const TwobidSDK = new TwobidSDKProxy();


