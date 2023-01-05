// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { type PrivateAssetPackListingData } from '../../Utils/GDevelopServices/Shop';
import {
  getPrivateAssetPack,
  type PrivateAssetPack,
} from '../../Utils/GDevelopServices/Asset';
import Text from '../../UI/Text';
import { t, Trans } from '@lingui/macro';
import { formatPrice } from '../../UI/PriceTag';
import AlertMessage from '../../UI/AlertMessage';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import { ResponsiveLineStackLayout, LineStackLayout } from '../../UI/Layout';
import { Column, Line } from '../../UI/Grid';
import {
  getUserPublicProfile,
  type UserPublicProfile,
} from '../../Utils/GDevelopServices/User';
import PublicProfileDialog from '../../Profile/PublicProfileDialog';
import Link from '../../UI/Link';
import Mark from '../../UI/CustomSvgIcons/Mark';
import Cross from '../../UI/CustomSvgIcons/Cross';
import ResponsiveImagesGallery from '../../UI/ResponsiveImagesGallery';
import { useResponsiveWindowWidth } from '../../UI/Reponsive/ResponsiveWindowMeasurer';
import RaisedButton from '../../UI/RaisedButton';
import { sendAssetPackBuyClicked } from '../../Utils/Analytics/EventSender';
import { MarkdownText } from '../../UI/MarkdownText';
import Paper from '../../UI/Paper';
import Window from '../../Utils/Window';
import ScrollView from '../../UI/ScrollView';

const sortedContentType = [
  'sprite',
  '9patch',
  'tiled',
  'particleEmitter',
  'font',
  'audio',
  'partial',
];

const contentTypeToMessageDescriptor = {
  sprite: t`Sprites`,
  '9patch': t`Panel sprites`,
  tiled: t`Tiled sprites`,
  particleEmitter: t`Particle emitters`,
  font: t`Fonts`,
  audio: t`Audios`,
  partial: t`Other`,
};

const styles = {
  disabledText: { opacity: 0.6 },
};

type Props = {|
  privateAssetPackListingData: PrivateAssetPackListingData,
  onOpenPurchaseDialog: () => void,
  isPurchaseDialogOpen: boolean,
  onAssetPackOpen: PrivateAssetPackListingData => void,
|};

const PrivateAssetPackInformationPage = ({
  privateAssetPackListingData,
  onOpenPurchaseDialog,
  isPurchaseDialogOpen,
  onAssetPackOpen,
}: Props) => {
  const { id, name, sellerId, prices } = privateAssetPackListingData;
  const [assetPack, setAssetPack] = React.useState<?PrivateAssetPack>(null);
  const [isFetching, setIsFetching] = React.useState<boolean>(false);
  const [
    openSellerPublicProfileDialog,
    setOpenSellerPublicProfileDialog,
  ] = React.useState<boolean>(false);
  const [
    sellerPublicProfile,
    setSellerPublicProfile,
  ] = React.useState<?UserPublicProfile>(null);
  const [errorText, setErrorText] = React.useState<?React.Node>(null);
  const windowWidth = useResponsiveWindowWidth();

  React.useEffect(
    () => {
      (async () => {
        setIsFetching(true);
        try {
          const assetPack = await getPrivateAssetPack(id);
          const profile = await getUserPublicProfile(sellerId);
          setAssetPack(assetPack);
          setSellerPublicProfile(profile);
        } catch (error) {
          if (error.response && error.response.status === 404) {
            setErrorText(
              <Trans>
                Asset pack not found - An error occurred, please try again
                later.
              </Trans>
            );
          } else {
            setErrorText(
              <Trans>An error occurred, please try again later.</Trans>
            );
          }
        } finally {
          setIsFetching(false);
        }
      })();
    },
    [id, sellerId]
  );

  const onClickBuy = () => {
    if (!assetPack) return;
    try {
      onOpenPurchaseDialog();
      sendAssetPackBuyClicked({
        assetPackId: assetPack.id,
        assetPackName: assetPack.name,
        assetPackTag: assetPack.tag,
        assetPackKind: 'private',
      });
    } catch (e) {
      console.warn('Unable to send event', e);
    }
  };

  const getBuyButton = i18n =>
    !errorText ? (
      <RaisedButton
        key="buy-asset-pack"
        primary
        label={
          !assetPack ? (
            <Trans>Loading...</Trans>
          ) : isPurchaseDialogOpen ? (
            <Trans>Processing...</Trans>
          ) : (
            <Trans>Buy for {formatPrice(i18n, prices[0].value)}</Trans>
          )
        }
        onClick={onClickBuy}
        disabled={!assetPack || isPurchaseDialogOpen}
        id="buy-asset-pack"
      />
    ) : null;

  return (
    <I18n>
      {({ i18n }) => (
        <>
          {errorText ? (
            <Line alignItems="center" justifyContent="center" expand>
              <AlertMessage kind="error">{errorText}</AlertMessage>
            </Line>
          ) : isFetching ? (
            <Column expand>
              <PlaceholderLoader />
            </Column>
          ) : assetPack && sellerPublicProfile ? (
            <Column noOverflowParent expand noMargin>
              <ScrollView autoHideScrollbar>
                <Column noMargin alignItems="flex-end">
                  <Text displayInlineAsSpan size="sub-title">
                    <Trans>by</Trans>{' '}
                    <Link
                      onClick={() => setOpenSellerPublicProfileDialog(true)}
                      href="#"
                    >
                      {sellerPublicProfile.username || ''}
                    </Link>
                  </Text>
                </Column>
                <ResponsiveLineStackLayout noColumnMargin noMargin>
                  <Column useFullHeight expand noMargin noOverflowParent>
                    <ResponsiveImagesGallery
                      imagesUrls={assetPack.previewImageUrls}
                      altTextTemplate={`Asset pack ${name} preview image {imageIndex}`}
                      horizontalOuterMarginToEatOnMobile={8}
                    />
                  </Column>
                  <Column useFullHeight expand noMargin>
                    <Paper
                      variant="outlined"
                      style={{ padding: windowWidth === 'small' ? 20 : 30 }}
                      background="medium"
                    >
                      <Column noMargin>
                        <Line
                          noMargin
                          expand
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Text noMargin size="block-title">
                            {formatPrice(i18n, prices[0].value)}
                          </Text>
                          {getBuyButton(i18n)}
                        </Line>
                        <Text size="body2" displayInlineAsSpan>
                          <MarkdownText
                            source={assetPack.longDescription}
                            allowParagraphs
                          />
                        </Text>
                        <ResponsiveLineStackLayout noMargin noColumnMargin>
                          <Column noMargin expand>
                            <Text size="sub-title">
                              <Trans>Content</Trans>
                            </Text>
                            {sortedContentType.map(type => {
                              if (assetPack.content[type]) {
                                return (
                                  <li key={type}>
                                    <Text displayInlineAsSpan noMargin>
                                      {assetPack.content[type]}{' '}
                                      {i18n._(
                                        contentTypeToMessageDescriptor[type]
                                      )}
                                    </Text>
                                  </li>
                                );
                              }
                              return null;
                            })}
                          </Column>
                          <Column noMargin expand>
                            <Text size="sub-title">
                              <Trans>Licensing</Trans>
                            </Text>
                            <LineStackLayout noMargin alignItems="center">
                              <Mark fontSize="small" />
                              <Text displayInlineAsSpan noMargin>
                                <Trans>Personal projects</Trans>
                              </Text>
                            </LineStackLayout>
                            <LineStackLayout noMargin alignItems="center">
                              <Mark fontSize="small" />
                              <Text displayInlineAsSpan noMargin>
                                <Trans>Professional projects</Trans>
                              </Text>
                            </LineStackLayout>
                            <LineStackLayout noMargin alignItems="center">
                              <Mark fontSize="small" />
                              <Text displayInlineAsSpan noMargin>
                                <Trans>Asset modification</Trans>
                              </Text>
                            </LineStackLayout>
                            <LineStackLayout noMargin alignItems="center">
                              <Cross
                                fontSize="small"
                                style={styles.disabledText}
                              />
                              <Text
                                displayInlineAsSpan
                                noMargin
                                style={styles.disabledText}
                              >
                                <Trans>Redistribution &amp; reselling</Trans>
                              </Text>
                            </LineStackLayout>
                            <Line noMargin>
                              <Text>
                                <Link
                                  onClick={() =>
                                    Window.openExternalURL(
                                      'https://gdevelop.io/page/asset-store-license-agreement'
                                    )
                                  }
                                  href="https://gdevelop.io/page/asset-store-license-agreement"
                                >
                                  <Trans>See details here</Trans>
                                </Link>
                              </Text>
                            </Line>
                          </Column>
                        </ResponsiveLineStackLayout>
                      </Column>
                    </Paper>
                  </Column>
                </ResponsiveLineStackLayout>
              </ScrollView>
            </Column>
          ) : null}
          {openSellerPublicProfileDialog && (
            <PublicProfileDialog
              userId={sellerId}
              onClose={() => setOpenSellerPublicProfileDialog(false)}
              onAssetPackOpen={assetPackListingData => {
                onAssetPackOpen(assetPackListingData);
                setOpenSellerPublicProfileDialog(false);
              }}
            />
          )}
        </>
      )}
    </I18n>
  );
};

export default PrivateAssetPackInformationPage;