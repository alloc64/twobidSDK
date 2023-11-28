import {registerPlugin} from "@capacitor/core";

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

export interface TwobidSDKImpl {
  registerAdView(args: { viewId: string }): void;

  event(args: { event: string, value: object }): void;

  insertAnchoredBannerAdInto(args: { placement: string, viewId: string }): void;

  insertInlineBannerAdInto(args: { placement: string, viewId: string }): void;

  showInterstitial(args: { placement: string, adSource?: AdSource }): Promise<void>;

  showRewardedVideo(args: { placement: string }, callback: (val: string) => void): Promise<void>;

  getDefaultProductPrice(args: { productName: string }): Promise<string>;

  purchaseConsumable(args: { purchaseId: string, productNames: string[] }, callback: PurchaseCallback): void;

  purchaseSubscription(args: {
    purchaseId: string,
    productName: string,
    offerId?: string | null
  }, callback: PurchaseCallback): void;

  getPurchases(): Promise<{ purchases: Purchase[] }>;

  registerPurchaseStateChange(callback: PurchaseStateChangeCallback): Promise<string>;

  unregisterPurchaseStateChange(options: { callbackId: string }): Promise<void>;

  rate(): void;

  update(): void;

  requestConsent(): Promise<{ hasConsent: boolean }>;

  changeConsent(): Promise<{ hasConsent: boolean }>;
}

export class TwobidSDKWebImpl implements TwobidSDKImpl {
  event(args: { event: string; value: object }): void {
    console.log("TwobidSDK::event ", args);
  }

  getDefaultProductPrice(args: { productName: string }): Promise<string> {
    return Promise.resolve("N/A");
  }

  insertAnchoredBannerAdInto(args: { placement: string; viewId: string }): void {
    console.log("TwobidSDK::insertAnchoredBannerAdInto ", args);
  }

  insertInlineBannerAdInto(args: { placement: string; viewId: string }): void {
    console.log("TwobidSDK::insertInlineBannerAdInto ", args);
  }

  purchaseConsumable(args: { purchaseId: string; productNames: string[] }, callback: PurchaseCallback): void {
    console.log("TwobidSDK::purchaseConsumable ", args);
  }

  purchaseSubscription(args: {
    purchaseId: string;
    productName: string;
    offerId?: string | null
  }, callback: PurchaseCallback): void {
    console.log("TwobidSDK::purchaseSubscription", args);
  }

  rate(): void {
    console.log("TwobidSDK::rate");
  }

  registerAdView(args: { viewId: string }): void {
    console.log("TwobidSDK::registerAdView ", args.viewId);
  }

  showInterstitial(args: { placement: string; adSource?: AdSource }): Promise<void> {
    console.log("TwobidSDK::showInterstitial ", args);
    return Promise.resolve(undefined);
  }

  showRewardedVideo(args: { placement: string }, callback: (val: string) => void): Promise<void> {
    console.log("TwobidSDK::showRewardedVideo ", args.placement);
    return Promise.resolve(undefined);
  }

  update(): void {
    console.log("TwobidSDK::update called");
  }

  requestConsent(): Promise<{ hasConsent: boolean }> {
    console.log("TwobidSDK::requestConsent called");
    return Promise.resolve({hasConsent: true});
  }

  changeConsent(): Promise<{ hasConsent: boolean }> {
    console.log("TwobidSDK::changeConsent called");
    return Promise.resolve({hasConsent: true});
  }

  getPurchases(): Promise<{ purchases: Purchase[] }> {
    return Promise.resolve({purchases: []});
  }

  registerPurchaseStateChange(callback: PurchaseStateChangeCallback): Promise<string> {
    return Promise.resolve("");
  }

  unregisterPurchaseStateChange(options: { callbackId: string }): Promise<void> {
    return Promise.resolve(undefined);
  }
}


let TwobidSDKPlugin = registerPlugin<TwobidSDKImpl>(
  'TwobidSDK',
  {
    web: () => new TwobidSDKWebImpl()
  }
);


export class TwobidSDKProxy implements TwobidSDKImpl {
  htmlAdViews: HTMLHtmlElement[] = [];

  constructor() {
    this.registerPurchaseStateChange(async (state) => {
      return this.updateAdViewsVisibility(state);
    }).then();
  }

  changeConsent(): Promise<{ hasConsent: boolean }> {
    return TwobidSDKPlugin.changeConsent();
  }

  event(args: { event: string; value: object }): void {
    TwobidSDKPlugin.event(args);
  }

  getDefaultProductPrice(args: { productName: string }): Promise<string> {
    return TwobidSDKPlugin.getDefaultProductPrice(args);
  }

  getPurchases(): Promise<{ purchases: Purchase[] }> {
    return TwobidSDKPlugin.getPurchases();
  }

  insertAnchoredBannerAdInto(args: { placement: string; viewId: string }): void {
    TwobidSDKPlugin.insertAnchoredBannerAdInto(args);
  }

  insertInlineBannerAdInto(args: { placement: string; viewId: string }): void {
    TwobidSDKPlugin.insertInlineBannerAdInto(args);
  }

  purchaseConsumable(args: { purchaseId: string; productNames: string[] }, callback: PurchaseCallback): void {
    TwobidSDKPlugin.purchaseConsumable(args, callback);
  }

  purchaseSubscription(args: {
    purchaseId: string;
    productName: string;
    offerId?: string | null
  }, callback: PurchaseCallback): void {
    TwobidSDKPlugin.purchaseSubscription(args, callback);
  }

  rate(): void {
    TwobidSDKPlugin.rate();
  }

  registerAdView(args: { viewId: string }): void {
    TwobidSDKPlugin.registerAdView(args);
  }

  registerHtmlAdView(view: HTMLHtmlElement) {
    if(!view) {
      console.log("Attempted to register undefined HTML adview");
      return;
    }

    this.htmlAdViews.push(view);
  };

  requestConsent(): Promise<{ hasConsent: boolean }> {
    return TwobidSDKPlugin.requestConsent();
  }

  showInterstitial(args: { placement: string; adSource?: AdSource }): Promise<void> {
    return TwobidSDKPlugin.showInterstitial(args);
  }

  showRewardedVideo(args: { placement: string }, callback: (val: string) => void): Promise<void> {
    return TwobidSDKPlugin.showRewardedVideo(args, callback);
  }

  update(): void {
    TwobidSDKPlugin.update();
  }

  registerPurchaseStateChange(callback: PurchaseStateChangeCallback): Promise<string> {
    return TwobidSDKPlugin.registerPurchaseStateChange(callback);
  }

  unregisterPurchaseStateChange(options: { callbackId: string }): Promise<void> {
    return TwobidSDKPlugin.unregisterPurchaseStateChange(options);
  }

  async showInterstitialIfNoPremium(args: { placement: string; adSource?: AdSource }) {
    if (await this.hasPremium())
      return;

    return TwobidSDKPlugin.showInterstitial(args);
  };

  async hasPremium() {
    const result = await TwobidSDKPlugin.getPurchases()

    for (const purchase of result.purchases)
      for (const lineItem of purchase.lineItems)
        if (lineItem.premium)
          return true;

    return false;
  };

  async updateAdViewsVisibility(result: PurchaseStateChangeResult) {
    console.log("TwobidSDK::updateAdViewsVisibility " + JSON.stringify(result));

    let hasPremium = await this.hasPremium();

    for(let view of this.htmlAdViews) {
      if(view && view.style)
        view.style.visibility = hasPremium ? "hidden" : "visible";
    }

    return Promise.resolve(undefined)
  }
}

export const TwobidSDK = new TwobidSDKProxy();
