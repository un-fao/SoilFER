import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Divider } from 'primereact/divider';
import { RadioButton, RadioButtonChangeEvent } from 'primereact/radiobutton';
import { SelectButton, SelectButtonChangeEvent } from 'primereact/selectbutton';
import { InfoTooltip } from '../shared/InfoTooltip';
import styled from 'styled-components';
import { theme } from '../../theme/theme';

const SubmitButton = styled.button`
  background-color: ${theme.colors.accent}; color: #333; border: none; padding: 10px; width: 100%;
  cursor: pointer; font-weight: bold; border-radius: ${theme.borderRadius.sm};
  margin-top: ${theme.spacing.sm}; font-size: ${theme.typography.fontSizeBase};
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;
const CancelButton = styled.button`
  background-color: ${theme.colors.primaryDark}; color: #fff; border: none; padding: 10px; width: 100%;
  cursor: pointer; font-weight: bold; border-radius: ${theme.borderRadius.sm};
  margin-top: ${theme.spacing.sm}; font-size: ${theme.typography.fontSizeBase};
`;
const MenuButton = styled.div`
  margin: 8px; padding: 8px; display: flex; flex-direction: row; justify-content: flex-start; align-items: center;
  width: 50%; background-color: #492815; border: 1px solid #fff; border-radius: 10px;
  cursor: pointer; transition: all 0.3s ease; box-shadow: 0px 4px 6px rgba(0,0,0,0.1);
  color: #fff; font-weight: bolder; font-size: 13pt;
  &:hover { background-color: #7e5134; }
`;

//const rowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.15)' };
const rowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', padding: '6px 0' };
const labelStyle: React.CSSProperties = { flex: 1, padding: '0 8px' };
const iconStyle: React.CSSProperties = { width: '28px', flexShrink: 0, textAlign: 'center' };
const yesNoStyle: React.CSSProperties = { display: 'flex', gap: '12px', flexShrink: 0, alignItems: 'center' };

type Section = 'Menu' | 'SoilTextureTest' | 'DrainageTest' | 'SoilColourTest' | 'CoarseFragmentsTest' | 'MottleAbundanceTest';

interface Item { name: string; value: number; }

interface SoilEntry {
  ID: string; HWSD2_SMU_ID?: string; SHARE?: string; WRB2?: string; ROOT_DEPTH?: string;
  DRAINAGE?: string; LAYER?: string; COARSE?: string; SAND?: string; SILT?: string;
  CLAY?: string; TEXTURE_USDA?: string; isCentre?: boolean; COLOUR?: string;
  TEXTURE?: string; DRAINAGE_CLASS?: string; minCoarse?: string; maxCoarse?: string;
  mottleAbundance?: string; Count?: number; Percentage?: string;
}

export const SoilTestQuestionnaire = (props: any) => {
  const {
    onSoilSelect, setKnownSoil, setCalculatedSoil, setCalculatedSoilMessage,
    soilSummary, WRB_lookup, setCropLayerVisible
  } = props;

  const { t } = useTranslation();

  const [activeSection, setActiveSection] = useState<Section>('Menu');
  const [textureEntry, setTextureEntry] = useState(false);
  const [drainageEntry, setDrainageEntry] = useState(false);
  const [colourEntry, setColourEntry] = useState(false);
  const [coarseFragmentsEntry, setCoarseFragmentsEntry] = useState(false);
  const [mottleAbundanceEntry, setMottleAbundanceEntry] = useState(false);

  const [balling, setBalling] = useState('');
  const [ribbon, setRibbon] = useState('');
  const [ribbonLength, setRibbonLength] = useState<Item | null>(null);
  const ribbonLengths: Item[] = [
    { name: t('soil.questionnaire.texture.ribbonLt'), value: 1 },
    { name: t('soil.questionnaire.texture.ribbonMid'), value: 2 },
    { name: t('soil.questionnaire.texture.ribbonGt'), value: 3 },
  ];
  const [grittiness, setGrittiness] = useState<Item | null>(null);
  const grittinesses: Item[] = [
    { name: t('soil.questionnaire.texture.veryGritty'), value: 1 },
    { name: t('soil.questionnaire.texture.somewhatGritty'), value: 2 },
    { name: t('soil.questionnaire.texture.notGritty'), value: 3 },
  ];
  const [smoothness, setSmoothness] = useState<Item | null>(null);
  const smoothnesses: Item[] = [
    { name: t('soil.questionnaire.texture.verySmooth'), value: 1 },
    { name: t('soil.questionnaire.texture.somewhatSmooth'), value: 2 },
    { name: t('soil.questionnaire.texture.notSmooth'), value: 3 },
  ];
  const [stickiness, setStickiness] = useState<Item | null>(null);
  const stickinesses: Item[] = [
    { name: t('soil.questionnaire.texture.verySticky'), value: 1 },
    { name: t('soil.questionnaire.texture.somewhatSticky'), value: 2 },
    { name: t('soil.questionnaire.texture.notSticky'), value: 3 },
  ];
  const [drainage, setDrainage] = useState('');
  const [colour, setColour] = useState('');
  const [rocksPebblesGravel, setRocksPebblesGravel] = useState('');
  const [whichRocksPebblesGravels, setWhichRocksPebblesGravels] = useState<Item | null>(null);
  const rocksPebblesGravels: Item[] = [
    { name: t('soil.questionnaire.coarse.rocks'), value: 1 },
    { name: t('soil.questionnaire.coarse.pebbles'), value: 2 },
    { name: t('soil.questionnaire.coarse.gravel'), value: 3 },
  ];
  const [coarseFragmentSize, setCoarseFragmentSize] = useState<Item | null>(null);
  const coarseFragmentSizes: Item[] = [
    { name: t('soil.questionnaire.coarse.small'), value: 1 },
    { name: t('soil.questionnaire.coarse.medium'), value: 2 },
    { name: t('soil.questionnaire.coarse.large'), value: 3 },
  ];
  const [coarseFragmentPercent, setCoarseFragmentPercent] = useState<Item | null>(null);
  const coarseFragmentPercents: Item[] = [
    { name: t('soil.questionnaire.coarse.lt15'), value: 1 },
    { name: t('soil.questionnaire.coarse.mid'), value: 2 },
    { name: t('soil.questionnaire.coarse.gt35'), value: 3 },
  ];
  const [digDifficult, setDigDifficult] = useState('');
  const [sizeQuantityOfMottles, setSizeQuantityOfMottles] = useState<Item | null>(null);
  const sizeQuantityOfMottless: Item[] = [
    { name: t('soil.questionnaire.mottle.none'), value: 0 },
    { name: t('soil.questionnaire.mottle.low'), value: 1 },
    { name: t('soil.questionnaire.mottle.moderate'), value: 2 },
    { name: t('soil.questionnaire.mottle.high'), value: 3 },
  ];
  const [colourDifference, setColourDifference] = useState('');
  const [irregularPatterns, setIrregularPatterns] = useState('');
  const [mottleSize, setMottleSize] = useState<Item | null>(null);
  const mottleSizes: Item[] = [
    { name: t('soil.questionnaire.mottle.small'), value: 1 },
    { name: t('soil.questionnaire.mottle.medium'), value: 2 },
    { name: t('soil.questionnaire.mottle.large'), value: 3 },
  ];

  const [resultTexture, setResultTexture] = useState('');
  const calculateTexture = () => {
    if (ribbonLength) {
      if (ribbonLength.value === 1) {
        if (grittiness?.value === 1) setResultTexture('Sandy loam');
        else if (grittiness?.value === 2) setResultTexture('Loam');
        else if (smoothness?.value === 1) setResultTexture('Silt loam');
        else setResultTexture('Unknown Texture');
      } else if (ribbonLength.value === 2) {
        if (grittiness?.value === 1) setResultTexture('Sandy clay loam');
        else if (stickiness?.value === 1) setResultTexture('Clay loam');
        else if (smoothness?.value === 1) setResultTexture('Silty clay loam');
        else setResultTexture('Unknown Texture');
      } else if (ribbonLength.value === 3) {
        if (stickiness?.value === 1 && smoothness?.value === 1) setResultTexture('Clay');
        else if (smoothness?.value === 1) setResultTexture('Silty clay');
        else setResultTexture('Unknown Texture');
      } else {
        setResultTexture('Unknown Texture');
      }
    } else {
      setResultTexture('Unknown Texture');
    }
  };

  const [resultCoarseFragments, setCoarseFragments] = useState('');
  const calculateCoarseFragments = () => {
    if (rocksPebblesGravel) {
      if (rocksPebblesGravel === 'No') {
        setCoarseFragments('None');
      } else {
        if (coarseFragmentPercent?.value === 1) setCoarseFragments('None');
        else if (coarseFragmentPercent?.value === 2) setCoarseFragments('Low');
        else if (coarseFragmentPercent?.value === 3) setCoarseFragments('High');
        else setCoarseFragments('Unknown Coarse Fragments');
      }
    } else {
      setCoarseFragments('Unknown Coarse Fragments');
    }
  };

  const [resultMottleAbundance, setMottleAbundance] = useState('');
  const calculateMottleAbundance = () => {
    if (sizeQuantityOfMottles) {
      if (sizeQuantityOfMottles.value === 0) {
        setMottleAbundance('None');
      } else {
        if (colourDifference === 'No' && irregularPatterns === 'No')
          setMottleAbundance('None');
        else if (colourDifference === 'Yes' && irregularPatterns === 'No' && mottleSize?.name === t('soil.questionnaire.mottle.small') && sizeQuantityOfMottles.value <= 2)
          setMottleAbundance('Low');
        else if (colourDifference === 'Yes' && irregularPatterns === 'Yes' && mottleSize?.name === t('soil.questionnaire.mottle.medium') && sizeQuantityOfMottles.value >= 2)
          setMottleAbundance('Moderate');
        else if (colourDifference === 'Yes' && irregularPatterns === 'Yes' && mottleSize?.name === t('soil.questionnaire.mottle.large') && sizeQuantityOfMottles.value > 2)
          setMottleAbundance('High');
        else
          setMottleAbundance('Undetermined');
      }
    } else {
      setMottleAbundance('Undetermined');
    }
  };

  useEffect(() => {
    calculateMottleAbundance();
  }, [mottleSize]); // eslint-disable-line react-hooks/exhaustive-deps

  function calculateSoil(
    soilSummaryArr: SoilEntry[], texture: string, drainageVal: string,
    coarse: string, colourVal: string, mottleAbundance: string
  ): SoilEntry[] {
    const soilFiltered = soilSummaryArr.filter((e) => e.TEXTURE === texture);
    const drainageFiltered = soilFiltered.filter((e) => e.DRAINAGE_CLASS === drainageVal);
    const coarseFiltered = drainageFiltered.filter((e) => e.minCoarse === coarse || e.maxCoarse === coarse);
    const colourFiltered = coarseFiltered.filter((e) => e.COLOUR === colourVal);
    const mottleFiltered = colourFiltered.filter((e) => e.mottleAbundance === mottleAbundance);

    const soilAlternateFiltered = soilSummaryArr.filter((e) => (
      (e.DRAINAGE_CLASS === drainageVal && (e.minCoarse === coarse || e.maxCoarse === coarse) && e.COLOUR === colourVal && e.mottleAbundance === mottleAbundance) ||
      (e.DRAINAGE_CLASS === drainageVal && (e.minCoarse === coarse || e.maxCoarse === coarse) && e.mottleAbundance === mottleAbundance) ||
      ((e.minCoarse === coarse || e.maxCoarse === coarse) && e.COLOUR === colourVal && e.mottleAbundance === mottleAbundance) ||
      (e.DRAINAGE_CLASS === drainageVal && e.COLOUR === colourVal && e.mottleAbundance === mottleAbundance) ||
      (e.DRAINAGE_CLASS === drainageVal && (e.minCoarse === coarse || e.maxCoarse === coarse) && e.COLOUR === colourVal) ||
      (e.DRAINAGE_CLASS === drainageVal && (e.minCoarse === coarse || e.maxCoarse === coarse))
    ));

    if (soilFiltered.length > 0) {
      if (drainageFiltered.length > 0) {
        if (coarseFiltered.length > 0) {
          if (colourFiltered.length > 0) {
            if (mottleFiltered.length > 0) return mottleFiltered;
            return colourFiltered;
          }
          return coarseFiltered;
        }
        return drainageFiltered;
      }
      return soilFiltered;
    } else {
      if (soilAlternateFiltered.length > 0) return soilAlternateFiltered;
      const largest = soilSummaryArr
        .filter((e) => e.TEXTURE !== 'Unknown')
        .reduce((best, cur) =>
          parseFloat(cur.SHARE || '0') > parseFloat(best.SHARE || '0') ? cur : best,
          {} as SoilEntry
        );
      if (Object.keys(largest).length > 0) return [largest];
      return [soilSummaryArr[0] as SoilEntry];
    }
  }

  const processSoil = () => {
    const Soil = calculateSoil(soilSummary, resultTexture, drainage, resultCoarseFragments, colour, resultMottleAbundance)[0];
    const wrbName = WRB_lookup[Soil.WRB2?.toUpperCase()]?.name || null;
    onSoilSelect(Soil.ID, Soil.WRB2, wrbName);
    if (textureEntry && drainageEntry && mottleAbundanceEntry) {
      setCalculatedSoilMessage('Based on your selections, we estimate that you soil is likely: ');
    } else if (textureEntry || drainageEntry || colourEntry || coarseFragmentsEntry || mottleAbundanceEntry) {
      setCalculatedSoilMessage('Your selections are insufficient to calculate your soil, the most abudant soil in your area is: ');
    } else {
      setCalculatedSoilMessage('You have not made any selections, the most abudant soil in your area is: ');
    }
    setCropLayerVisible(true);
  };

  const goTo = (section: Section) => setActiveSection(section);

  const canCalculateTexture =
    balling === 'No' ||
    (balling === 'Yes' && ribbon === 'No') ||
    (balling === 'Yes' && ribbon === 'Yes' && ribbonLength && smoothness && stickiness);

  const canCalculateCoarse =
    rocksPebblesGravel === 'No' ||
    (rocksPebblesGravel === 'Yes' && coarseFragmentSize && coarseFragmentPercent);

  const canFinishMottle =
    (sizeQuantityOfMottles && sizeQuantityOfMottles.value === 0) ||
    (sizeQuantityOfMottles && sizeQuantityOfMottles.value > 0 && colourDifference && irregularPatterns && mottleSize);

  const colourSwatches: { value: string; hex: string; img: string }[] = [
    { value: 'Blackish', hex: '#1c1a1b', img: 'blackish.png' },
    { value: 'Blueish / Greenish or Grayish', hex: '#367588', img: 'blueish.png' },
    { value: 'Brownish', hex: '#964B00', img: 'brownish.png' },
    { value: 'Reddish', hex: '#86391a', img: 'reddish.png' },
    { value: 'Whitish', hex: '#ccc', img: 'whitish.png' },
    { value: 'Yellowish', hex: '#8d8d35', img: 'yellowish.png' },
  ];

  const [colourPhotoVisible, setColourPhotoVisible] = useState<string | null>(null);

  return (
    <>
      {/* ── MENU ─────────────────────────────────────────────────────────── */}
      {activeSection === 'Menu' && (
        <div className="m-0 p-0 w-full">
          <div style={{ fontWeight: 'bold' }}>
            <p>
              {t('soil.questionnaire.intro')}
            </p>
            <p>
              {t('soil.questionnaire.topsoilNote')}
            </p>
          </div>
          <div className="flex flex-column">
            <MenuButton onClick={() => goTo('SoilTextureTest')}>
              <img src={`${process.env.PUBLIC_URL}/images/SoilTextureIcon.png`} alt="Soil Texture Icon" style={{ height: '40px', marginRight: '10px' }} />
              {t('soil.questionnaire.textureTest')}
            </MenuButton>
            <MenuButton onClick={() => goTo('DrainageTest')}>
              <img src={`${process.env.PUBLIC_URL}/images/DrainageIcon.png`} alt="Drainage Icon" style={{ height: '40px', marginRight: '10px' }} />
              {t('soil.questionnaire.drainageTest')}
            </MenuButton>
            <MenuButton onClick={() => goTo('SoilColourTest')}>
              <img src={`${process.env.PUBLIC_URL}/images/SoilColourIcon.png`} alt="Soil Colour Icon" style={{ height: '40px', marginRight: '10px' }} />
              {t('soil.questionnaire.colourTest')}
            </MenuButton>
            <MenuButton onClick={() => goTo('CoarseFragmentsTest')}>
              <img src={`${process.env.PUBLIC_URL}/images/CoarseFragmentsIcon.png`} alt="Coarse Fragments Icon" style={{ height: '40px', marginRight: '10px' }} />
              {t('soil.questionnaire.coarseTest')}
            </MenuButton>
            <MenuButton onClick={() => goTo('MottleAbundanceTest')}>
              <img src={`${process.env.PUBLIC_URL}/images/MottleAbundanceIcon.png`} alt="Mottle Abundance Icon" style={{ height: '40px', marginRight: '10px' }} />
              {t('soil.questionnaire.mottleTest')}
            </MenuButton>
          </div>
          <Divider />
          <SubmitButton
            style={{ fontSize: theme.typography.fontSizeLg }}
            onClick={() => {
              processSoil();
              setResultTexture('');
              setCoarseFragments('');
              setMottleAbundance('');
              setCalculatedSoil(true);
              setKnownSoil('Yes');
            }}
          >{t('soil.questionnaire.recalculate')}</SubmitButton>
        </div>
      )}

      {/* ── SOIL TEXTURE TEST ────────────────────────────────────────────── */}
      {activeSection === 'SoilTextureTest' && (
        <div className="m-0 p-0 w-full">
          <h2 className="m-0 p-0">
            <div className="m-0 p-0 flex flex-row justify-content-start" style={{ fontSize: theme.typography.fontSizeXl }}>
              <img src={`${process.env.PUBLIC_URL}/images/SoilTextureIcon.png`} alt="Soil Texture Icon" style={{ height: '25px', marginRight: '10px' }} />
              {t('soil.questionnaire.texture.title')}
            </div>
          </h2>
          <Divider />
          <div >
            {/* Ball Test */}
            <div style={rowStyle}>
              <div style={iconStyle}><InfoTooltip content={t('soil.questionnaire.texture.ballDesc')} /></div>
              <div style={labelStyle}><b>{t('soil.questionnaire.texture.ballTest')}</b></div>
              <div style={yesNoStyle}>
                <div className="flex align-items-center w-full">
                  <RadioButton inputId="ballingYes" name="balling" value="Yes"
                    onChange={(e: RadioButtonChangeEvent) => { setBalling(e.value); setRibbon(''); setResultTexture(''); setTextureEntry(true); }}
                    checked={balling === 'Yes'} />
                  <label htmlFor="ballingYes" className="ml-2">{t('soil.questionnaire.yes')}</label>
                </div>
                <div className="flex align-items-center w-full">
                  <RadioButton inputId="ballingNo" name="balling" value="No"
                    onChange={(e: RadioButtonChangeEvent) => { setBalling(e.value); setRibbon(''); setResultTexture('Sand'); setTextureEntry(true); }}
                    checked={balling === 'No'} />
                  <label htmlFor="ballingNo" className="ml-2">{t('soil.questionnaire.no')}</label>
                </div>
              </div>
            </div>

            {balling === 'Yes' && (
              <>
                {/* Ribbon Test */}
                <div style={rowStyle}>
                  <div style={iconStyle}><InfoTooltip content={t('soil.questionnaire.texture.ribbonDesc')} /></div>
                  <div style={labelStyle}><b>{t('soil.questionnaire.texture.ribbonTest')}</b></div>
                  <div style={yesNoStyle}>
                    <div className="flex align-items-center w-full">
                      <RadioButton inputId="ribbonYes" name="ribbon" value="Yes"
                        onChange={(e: RadioButtonChangeEvent) => { setRibbon(e.value); setResultTexture(''); }}
                        checked={ribbon === 'Yes'} />
                      <label htmlFor="ribbonYes" className="ml-2">{t('soil.questionnaire.yes')}</label>
                    </div>
                    <div className="flex align-items-center w-full">
                      <RadioButton inputId="ribbonNo" name="ribbon" value="No"
                        onChange={(e: RadioButtonChangeEvent) => { setRibbon(e.value); setResultTexture('Loamy sand'); }}
                        checked={ribbon === 'No'} />
                      <label htmlFor="ribbonNo" className="ml-2">{t('soil.questionnaire.no')}</label>
                    </div>
                  </div>
                </div>

                {ribbon === 'Yes' && (
                  <>
                    {/* Ribbon Length */}
                    <div style={{ ...rowStyle, borderBottom: 'none' }}>
                      <div style={iconStyle}><InfoTooltip content={t('soil.questionnaire.texture.ribbonLengthDesc')} /></div>
                      <div style={labelStyle}><b>{t('soil.questionnaire.texture.ribbonLength')}</b></div>
                    </div>
                    <div style={rowStyle}>
                      <div style={{ width: '28px', flexShrink: 0 }} />
                      <div style={{ flex: 1, padding: '0 8px' }}>
                        <div className="flex flex-row p-0 m-0 gap-1">
                          {ribbonLengths.map((cat) => (
                            <div key={cat.name} className="flex align-items-center w-full">
                              <RadioButton inputId={`rl-${cat.value}`} name="ribbonLength" value={cat}
                                onChange={(e: RadioButtonChangeEvent) => setRibbonLength(e.value)}
                                checked={ribbonLength?.value === cat.value} />
                              <label htmlFor={`rl-${cat.value}`} className="ml-2" >{cat.name}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Grittiness */}
                    <div style={{ ...rowStyle, borderBottom: 'none' }}>
                      <div style={iconStyle}><InfoTooltip content={t('soil.questionnaire.texture.grittinessDesc')} /></div>
                      <div style={labelStyle}><b>{t('soil.questionnaire.texture.grittiness')}</b></div>
                    </div>
                    <div style={rowStyle}>
                      <div style={{ width: '28px', flexShrink: 0 }} />
                      <div style={{ flex: 1, padding: '0 8px' }}>
                        <div className="flex flex-row p-0 m-0 gap-1">
                          {grittinesses.map((cat) => (
                            <div key={cat.name} className="flex align-items-center w-full">
                              <RadioButton inputId={`grit-${cat.value}`} name="grittiness" value={cat}
                                onChange={(e: RadioButtonChangeEvent) => setGrittiness(e.value)}
                                checked={grittiness?.value === cat.value} />
                              <label htmlFor={`grit-${cat.value}`} className="ml-2" >{cat.name}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Smoothness */}
                    <div style={{ ...rowStyle, borderBottom: 'none' }}>
                      <div style={iconStyle}><InfoTooltip content={t('soil.questionnaire.texture.smoothnessDesc')} /></div>
                      <div style={labelStyle}><b>{t('soil.questionnaire.texture.smoothness')}</b></div>
                    </div>
                    <div style={rowStyle}>
                      <div style={{ width: '28px', flexShrink: 0 }} />
                      <div style={{ flex: 1, padding: '0 8px' }}>
                        <div className="flex flex-row p-0 m-0 gap-1">
                          {smoothnesses.map((cat) => (
                            <div key={cat.name} className="flex align-items-center w-full">
                              <RadioButton inputId={`smooth-${cat.value}`} name="smoothness" value={cat}
                                onChange={(e: RadioButtonChangeEvent) => setSmoothness(e.value)}
                                checked={smoothness?.value === cat.value} />
                              <label htmlFor={`smooth-${cat.value}`} className="ml-2" >{cat.name}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Stickiness */}
                    <div style={{ ...rowStyle, borderBottom: 'none' }}>
                      <div style={iconStyle}><InfoTooltip content={t('soil.questionnaire.texture.stickinessDesc')} /></div>
                      <div style={labelStyle}><b>{t('soil.questionnaire.texture.stickiness')}</b></div>
                    </div>
                    <div style={rowStyle}>
                      <div style={{ width: '28px', flexShrink: 0 }} />
                      <div style={{ flex: 1, padding: '0 8px' }}>
                        <div className="flex flex-row p-0 m-0 gap-1">
                          {stickinesses.map((cat) => (
                            <div key={cat.name} className="flex align-items-center w-full">
                              <RadioButton inputId={`stick-${cat.value}`} name="stickiness" value={cat}
                                onChange={(e: RadioButtonChangeEvent) => setStickiness(e.value)}
                                checked={stickiness?.value === cat.value} />
                              <label htmlFor={`stick-${cat.value}`} className="ml-2" >{cat.name}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          <Divider />
          <div className="flex flex-row gap-1">
            <CancelButton style={{ fontSize: theme.typography.fontSizeLg }} onClick={() => goTo('Menu')}>
              {t('soil.questionnaire.texture.back')}
            </CancelButton>
            {canCalculateTexture && (
              <SubmitButton style={{ fontSize: theme.typography.fontSizeLg }} onClick={() => { calculateTexture(); goTo('DrainageTest'); }}>
                {t('soil.questionnaire.texture.next')}
              </SubmitButton>
            )}
          </div>
        </div>
      )}

      {/* ── DRAINAGE TEST ────────────────────────────────────────────────── */}
      {activeSection === 'DrainageTest' && (
        <div className="m-0 p-0 w-full">
          <h2 className="m-0 p-0">
            <div className="m-0 p-0 flex flex-row justify-content-start" style={{ fontSize: theme.typography.fontSizeXl }}>
              <img src={`${process.env.PUBLIC_URL}/images/DrainageIcon.png`} alt="Drainage Icon" style={{ height: '25px', marginRight: '10px' }} />
              {t('soil.questionnaire.drainage.title')}
            </div>
          </h2>
          <div style={{ marginTop: '5px', fontWeight: 'bold' }}>{t('soil.questionnaire.drainage.instruction')}</div>
          <Divider />
          <div >
            {[
              { id: 'drainage1', value: 'Excessively drained', label: t('soil.questionnaire.drainage.excessive') },
              { id: 'drainage2', value: 'Somewhat excessively drained', label: t('soil.questionnaire.drainage.somewhatExcessive') },
              { id: 'drainage3', value: 'Well drained', label: t('soil.questionnaire.drainage.well') },
              { id: 'drainage4', value: 'Moderately well drained', label: t('soil.questionnaire.drainage.moderatelyWell') },
              { id: 'drainage5', value: 'Imperfectly drained', label: t('soil.questionnaire.drainage.imperfect') },
              { id: 'drainage6', value: 'Poorly drained', label: t('soil.questionnaire.drainage.poor') },
            ].map((opt) => (
              <div key={opt.id} style={rowStyle}>
                <div style={iconStyle}>
                  <RadioButton inputId={opt.id} name="drainage" value={opt.value}
                    onChange={(e: RadioButtonChangeEvent) => { setDrainage(e.value); setDrainageEntry(true); }}
                    checked={drainage === opt.value} />
                </div>
                <div style={labelStyle}>
                  <label htmlFor={opt.id}><b>{opt.label}</b></label>
                </div>
              </div>
            ))}
          </div>
          <Divider />
          <div className="flex flex-row gap-1">
            <CancelButton style={{ fontSize: theme.typography.fontSizeLg }} onClick={() => goTo('SoilTextureTest')}>
              {t('soil.questionnaire.drainage.back')}
            </CancelButton>
            {drainage && (
              <SubmitButton style={{ fontSize: theme.typography.fontSizeLg }} onClick={() => goTo('SoilColourTest')}>
                {t('soil.questionnaire.drainage.next')}
              </SubmitButton>
            )}
          </div>
          <CancelButton style={{ fontSize: theme.typography.fontSizeLg }} onClick={() => goTo('Menu')}>
            {t('soil.questionnaire.texture.back')}
          </CancelButton>
        </div>
      )}

      {/* ── SOIL COLOUR TEST ─────────────────────────────────────────────── */}
      {activeSection === 'SoilColourTest' && (
        <div className="m-0 p-0 w-full">
          <h2 className="m-0 p-0">
            <div className="m-0 p-0 flex flex-row justify-content-start" style={{ fontSize: theme.typography.fontSizeXl }}>
              <img src={`${process.env.PUBLIC_URL}/images/SoilColourIcon.png`} alt="Soil Colour Icon" style={{ height: '25px', marginRight: '10px' }} />
              {t('soil.questionnaire.colour.title')}
            </div>
          </h2>
          <div style={{ marginTop: '5px', fontWeight: 'bold' }}>{t('soil.questionnaire.colour.instruction')}</div>
          <Divider />
          <div >
            {colourSwatches.map((swatch) => (
              <div key={swatch.value} style={rowStyle}>
                <div style={iconStyle}>
                  <RadioButton inputId={`colour-${swatch.value}`} name="colour" value={swatch.value}
                    onChange={(e: RadioButtonChangeEvent) => { setColour(e.value); setColourEntry(true); }}
                    checked={colour === swatch.value} />
                </div>
                <div style={labelStyle}>
                  <label htmlFor={`colour-${swatch.value}`}><b>{swatch.value}</b></label>
                </div>
                <div style={{ width: '50px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <div
                    style={{ backgroundColor: swatch.hex, width: '40px', height: '30px', border: '1px solid #fff', padding: 0, margin: '5px', cursor: 'pointer' }}
                    onClick={() => setColourPhotoVisible(colourPhotoVisible === swatch.value ? null : swatch.value)}
                  />
                  {colourPhotoVisible === swatch.value && (
                    <div
                      style={{ position: 'absolute', top: 0, right: '50px', color: '#555', border: '1px solid #555', borderRadius: '5px', backgroundColor: '#ffeecc', padding: '5px', zIndex: 2 }}
                      onClick={() => setColourPhotoVisible(null)}
                    >
                      <div><i className="pi pi-times-circle p-0 m-1 cursor-pointer" style={{ color: '#999', float: 'right' }} onClick={() => setColourPhotoVisible(null)} /></div>
                      <img src={`${process.env.PUBLIC_URL}/images/${swatch.img}`} alt={swatch.value} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Divider />
          <div className="flex flex-row gap-1">
            <CancelButton style={{ fontSize: theme.typography.fontSizeLg }} onClick={() => goTo('DrainageTest')}>
              {t('soil.questionnaire.coarse.back')}
            </CancelButton>
            {colour && (
              <SubmitButton style={{ fontSize: theme.typography.fontSizeLg }} onClick={() => goTo('CoarseFragmentsTest')}>
                {t('soil.questionnaire.colour.next')}
              </SubmitButton>
            )}
          </div>
          <CancelButton style={{ fontSize: theme.typography.fontSizeLg }} onClick={() => goTo('Menu')}>
            {t('soil.questionnaire.texture.back')}
          </CancelButton>
        </div>
      )}

      {/* ── COARSE FRAGMENTS TEST ────────────────────────────────────────── */}
      {activeSection === 'CoarseFragmentsTest' && (
        <div className="m-0 p-0 w-full">
          <h2 className="m-0 p-0">
            <div className="m-0 p-0 flex flex-row justify-content-start" style={{ fontSize: theme.typography.fontSizeXl }}>
              <img src={`${process.env.PUBLIC_URL}/images/CoarseFragmentsIcon.png`} alt="Coarse Fragments Icon" style={{ height: '25px', marginRight: '10px' }} />
              {t('soil.questionnaire.coarse.title')}
            </div>
          </h2>
          <Divider />
          <div >
            <div style={rowStyle}>
              <div style={labelStyle}><b>{t('soil.questionnaire.coarse.hasFragments')}</b></div>
              <div style={yesNoStyle}>
                <div className="flex align-items-center w-full">
                  <RadioButton inputId="rocksPebblesGravelYes" name="rocksPebblesGravel" value="Yes"
                    onChange={(e: RadioButtonChangeEvent) => { setRocksPebblesGravel(e.value); setCoarseFragmentsEntry(true); }}
                    checked={rocksPebblesGravel === 'Yes'} />
                  <label htmlFor="rocksPebblesGravelYes" className="ml-2">{t('soil.questionnaire.yes')}</label>
                </div>
                <div className="flex align-items-center w-full">
                  <RadioButton inputId="rocksPebblesGravelNo" name="rocksPebblesGravel" value="No"
                    onChange={(e: RadioButtonChangeEvent) => { setRocksPebblesGravel(e.value); setCoarseFragments('None'); setCoarseFragmentsEntry(true); }}
                    checked={rocksPebblesGravel === 'No'} />
                  <label htmlFor="rocksPebblesGravelNo" className="ml-2">{t('soil.questionnaire.no')}</label>
                </div>
              </div>
            </div>

            {rocksPebblesGravel === 'Yes' && (
              <>
                <div style={{ ...rowStyle, borderBottom: 'none' }}>
                  <div style={labelStyle}><b>{t('soil.questionnaire.coarse.size')}</b></div>
                </div>
                <div style={rowStyle}>
                  <div style={{ flex: 1, padding: '0 8px' }}>
                    <div className="flex flex-row p-0 m-0 gap-1">
                      {coarseFragmentSizes.map((cat) => (
                        <div key={cat.name} className="flex align-items-center w-full">
                          <RadioButton inputId={`cfsize-${cat.value}`} name="coarseFragmentSize" value={cat}
                            onChange={(e: RadioButtonChangeEvent) => { setCoarseFragmentSize(e.value); setCoarseFragmentsEntry(true); }}
                            checked={coarseFragmentSize?.value === cat.value} />
                          <label htmlFor={`cfsize-${cat.value}`} className="ml-2" >{cat.name}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ ...rowStyle, borderBottom: 'none' }}>
                  <div style={labelStyle}><b>{t('soil.questionnaire.coarse.percentage')}</b></div>
                </div>
                <div style={rowStyle}>
                  <div style={{ flex: 1, padding: '0 8px' }}>
                    <div className="flex flex-row p-0 m-0 gap-1">
                      {coarseFragmentPercents.map((cat) => {
                        const coarseFragment = cat.value === 1 ? 'None' : cat.value === 2 ? 'Low' : 'High';
                        return (
                          <div key={cat.name} className="flex align-items-center w-full">
                            <RadioButton inputId={`cfpct-${cat.value}`} name="coarseFragmentPercent" value={cat}
                              onChange={(e: RadioButtonChangeEvent) => { setCoarseFragmentPercent(e.value); setCoarseFragments(coarseFragment); setCoarseFragmentsEntry(true); }}
                              checked={coarseFragmentPercent?.value === cat.value} />
                            <label htmlFor={`cfpct-${cat.value}`} className="ml-2" >{cat.name}</label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div style={rowStyle}>
                  <div style={labelStyle}><b>{t('soil.questionnaire.coarse.hardToDig')}</b></div>
                  <div style={yesNoStyle}>
                    <div className="flex align-items-center w-full">
                      <RadioButton inputId="digDifficultYes" name="digDifficult" value="Yes"
                        onChange={(e: RadioButtonChangeEvent) => { setDigDifficult(e.value); setCoarseFragmentsEntry(true); }}
                        checked={digDifficult === 'Yes'} />
                      <label htmlFor="digDifficultYes" className="ml-2">{t('soil.questionnaire.yes')}</label>
                    </div>
                    <div className="flex align-items-center w-full">
                      <RadioButton inputId="digDifficultNo" name="digDifficult" value="No"
                        onChange={(e: RadioButtonChangeEvent) => { setDigDifficult(e.value); setCoarseFragmentsEntry(true); }}
                        checked={digDifficult === 'No'} />
                      <label htmlFor="digDifficultNo" className="ml-2">{t('soil.questionnaire.no')}</label>
                    </div>
                  </div>
                </div>

                <div style={{ ...rowStyle, borderBottom: 'none' }}>
                  <div style={iconStyle}>
                    <InfoTooltip content={<img src={`${process.env.PUBLIC_URL}/images/coarsefragments.png`} alt="Coarse fragments" style={{ height: '125px' }} />} />
                  </div>
                  <div style={labelStyle}><b>{t('soil.questionnaire.coarse.contains')}</b></div>
                </div>
                <div style={{ ...rowStyle, borderBottom: 'none' }}>
                  <div style={{ width: '28px', flexShrink: 0 }} />
                  <div style={{ flex: 1, padding: '0 8px' }}>
                    <SelectButton value={whichRocksPebblesGravels}
                      onChange={(e: SelectButtonChangeEvent) => { setWhichRocksPebblesGravels(e.value); setCoarseFragmentsEntry(true); }}
                      optionLabel="name" options={rocksPebblesGravels} multiple />
                  </div>
                </div>
              </>
            )}
          </div>
          <Divider />
          <div className="flex flex-row gap-1">
            <CancelButton style={{ fontSize: theme.typography.fontSizeLg }} onClick={() => goTo('SoilColourTest')}>
              {t('soil.questionnaire.coarse.back')}
            </CancelButton>
            {canCalculateCoarse && (
              <SubmitButton style={{ fontSize: theme.typography.fontSizeLg }} onClick={() => { calculateCoarseFragments(); goTo('MottleAbundanceTest'); }}>
                {t('soil.questionnaire.coarse.next')}
              </SubmitButton>
            )}
          </div>
          <CancelButton style={{ fontSize: theme.typography.fontSizeLg }} onClick={() => goTo('Menu')}>
            {t('soil.questionnaire.coarse.backSoil')}
          </CancelButton>
        </div>
      )}

      {/* ── MOTTLE ABUNDANCE TEST ────────────────────────────────────────── */}
      {activeSection === 'MottleAbundanceTest' && (
        <div className="m-0 p-0 w-full">
          <h2 className="m-0 p-0">
            <div className="m-0 p-0 flex flex-row justify-content-start" style={{ fontSize: theme.typography.fontSizeXl }}>
              <img src={`${process.env.PUBLIC_URL}/images/MottleAbundanceIcon.png`} alt="Mottle Abundance Icon" style={{ height: '25px', marginRight: '10px' }} />
              {t('soil.questionnaire.mottle.title')}
            </div>
          </h2>
          <Divider />
          <div >
            <div style={{ ...rowStyle, borderBottom: 'none' }}>
              <div style={iconStyle}>
                <InfoTooltip content={<img src={`${process.env.PUBLIC_URL}/images/mottleabundance.png`} alt="Mottle Abundance" style={{ height: '175px' }} />} />
              </div>
              <div style={labelStyle}><b>{t('soil.questionnaire.mottle.instruction')}</b></div>
            </div>
            <div style={rowStyle}>
              <div style={{ width: '28px', flexShrink: 0 }} />
              <div style={{ flex: 1, padding: '0 8px' }}>
                <div className="flex flex-row p-0 m-0 gap-1">
                  {sizeQuantityOfMottless.map((cat) => (
                    <div key={cat.name} className="flex align-items-center w-full">
                      <RadioButton inputId={`mottle-${cat.value}`} name="sizeQuantityOfMottles" value={cat}
                        onChange={(e: RadioButtonChangeEvent) => { setSizeQuantityOfMottles(e.value); calculateMottleAbundance(); setMottleAbundanceEntry(true); }}
                        checked={sizeQuantityOfMottles?.value === cat.value} />
                      <label htmlFor={`mottle-${cat.value}`} className="ml-2" >{cat.name}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {sizeQuantityOfMottles && sizeQuantityOfMottles.value > 0 && (
              <>
                <div style={rowStyle}>
                  <div style={{ width: '28px', flexShrink: 0 }} />
                  <div style={labelStyle}><b>{t('soil.questionnaire.mottle.colorDiff')}</b></div>
                  <div style={yesNoStyle}>
                    <div className="flex align-items-center w-full">
                      <RadioButton inputId="colourDiffYes" name="colourDifference" value="Yes"
                        onChange={(e: RadioButtonChangeEvent) => { setColourDifference(e.value); calculateMottleAbundance(); setMottleAbundanceEntry(true); }}
                        checked={colourDifference === 'Yes'} />
                      <label htmlFor="colourDiffYes" className="ml-2">{t('soil.questionnaire.yes')}</label>
                    </div>
                    <div className="flex align-items-center w-full">
                      <RadioButton inputId="colourDiffNo" name="colourDifference" value="No"
                        onChange={(e: RadioButtonChangeEvent) => { setColourDifference(e.value); calculateMottleAbundance(); setMottleAbundanceEntry(true); }}
                        checked={colourDifference === 'No'} />
                      <label htmlFor="colourDiffNo" className="ml-2">{t('soil.questionnaire.no')}</label>
                    </div>
                  </div>
                </div>

                <div style={rowStyle}>
                  <div style={{ width: '28px', flexShrink: 0 }} />
                  <div style={labelStyle}><b>{t('soil.questionnaire.mottle.irregularPatterns')}</b></div>
                  <div style={yesNoStyle}>
                    <div className="flex align-items-center w-full">
                      <RadioButton inputId="irregularYes" name="irregularPatterns" value="Yes"
                        onChange={(e: RadioButtonChangeEvent) => { setIrregularPatterns(e.value); calculateMottleAbundance(); setMottleAbundanceEntry(true); }}
                        checked={irregularPatterns === 'Yes'} />
                      <label htmlFor="irregularYes" className="ml-2">{t('soil.questionnaire.yes')}</label>
                    </div>
                    <div className="flex align-items-center w-full">
                      <RadioButton inputId="irregularNo" name="irregularPatterns" value="No"
                        onChange={(e: RadioButtonChangeEvent) => { setIrregularPatterns(e.value); calculateMottleAbundance(); setMottleAbundanceEntry(true); }}
                        checked={irregularPatterns === 'No'} />
                      <label htmlFor="irregularNo" className="ml-2">{t('soil.questionnaire.no')}</label>
                    </div>
                  </div>
                </div>

                <div style={{ ...rowStyle, borderBottom: 'none' }}>
                  <div style={{ width: '28px', flexShrink: 0 }} />
                  <div style={labelStyle}><b>{t('soil.questionnaire.mottle.size')}</b></div>
                </div>
                <div style={{ ...rowStyle, borderBottom: 'none' }}>
                  <div style={{ width: '28px', flexShrink: 0 }} />
                  <div style={{ flex: 1, padding: '0 8px' }}>
                    <div className="flex flex-row p-0 m-0 gap-1">
                      {mottleSizes.map((cat) => (
                        <div key={cat.name} className="flex align-items-center w-full">
                          <RadioButton inputId={`mottlesize-${cat.value}`} name="mottleSize" value={cat}
                            onChange={(e: RadioButtonChangeEvent) => { setMottleSize(e.value); setMottleAbundanceEntry(true); }}
                            checked={mottleSize?.value === cat.value} />
                          <label htmlFor={`mottlesize-${cat.value}`} className="ml-2" >{cat.name}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <Divider />
          <div className="flex flex-row gap-1">
            <CancelButton style={{ fontSize: theme.typography.fontSizeLg }}
              onClick={() => {
                setSizeQuantityOfMottles(null);
                setRocksPebblesGravel('');
                setWhichRocksPebblesGravels(null);
                setCoarseFragmentSize(null);
                setCoarseFragmentPercent(null);
                goTo('CoarseFragmentsTest');
              }}
            >{t('soil.questionnaire.mottle.back')}</CancelButton>
            <CancelButton style={{ fontSize: theme.typography.fontSizeLg }} onClick={() => goTo('Menu')}>
              {t('soil.questionnaire.texture.back')}
            </CancelButton>
          </div>
          {canFinishMottle && (
            <SubmitButton style={{ fontSize: theme.typography.fontSizeLg }}
              onClick={() => {
                calculateMottleAbundance();
                processSoil();
                setResultTexture('');
                setCoarseFragments('');
                setMottleAbundance('');
                setCalculatedSoil(true);
                setKnownSoil('Yes');
              }}
            >{t('soil.questionnaire.recalculate')}</SubmitButton>
          )}
        </div>
      )}
    </>
  );
};
