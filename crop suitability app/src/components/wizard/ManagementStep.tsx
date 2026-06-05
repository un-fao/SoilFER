import React, { useState } from 'react';
import { RadioButton, RadioButtonChangeEvent } from 'primereact/radiobutton';
import { Divider } from 'primereact/divider';
import { useAppContext } from '../../store/AppContext';
import styled from 'styled-components';
import { theme } from '../../theme/theme';
import { useTranslation } from 'react-i18next';

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

const QUESTIONS = [
  { key: 'q1', name: 'goal',      items: [{ key: 'q1opt1', value: 1 }, { key: 'q1opt2', value: 2 }] },
  { key: 'q2', name: 'variety',   items: [{ key: 'q2opt1', value: 1 }, { key: 'q2opt2', value: 2 }] },
  { key: 'q3', name: 'labour',    items: [{ key: 'q3opt1', value: 1 }, { key: 'q3opt2', value: 2 }] },
  { key: 'q4', name: 'fertilizer',items: [{ key: 'q4opt1', value: 1 }, { key: 'q4opt2', value: 2 }] },
  { key: 'q5', name: 'chemical',  items: [{ key: 'q5opt1', value: 1 }, { key: 'q5opt2', value: 2 }] },
  { key: 'q6', name: 'fertility', items: [{ key: 'q6opt1', value: 1 }, { key: 'q6opt2', value: 2 }] },
];

export const ManagementStep: React.FC = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useAppContext();
  const { input, irrigation } = state;

  const setInput = (value: string, inputCode: string) =>
    dispatch({ type: 'SET_INPUT', payload: { input: value, inputCode } });

  const [dontKnow, setDontKnow] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});

  const setAnswer = (name: string, value: number) =>
    setAnswers((prev) => ({ ...prev, [name]: value }));

  const calculate = () => {
    const labour = answers['labour'];
    const variety = answers['variety'];
    const fertilizer = answers['fertilizer'];
    const chemical = answers['chemical'];
    if (labour === 2 || (variety === 2 && (fertilizer === 2 || chemical === 2))) {
      setInput('High', 'H');
    } else {
      setInput('Low', 'L');
    }
    setDontKnow(false);
  };

  return (
    <>
      {!dontKnow && (
        <div className="card">
          <div className="card">
            <div className="flex flex-row p-0 m-0" style={{ fontSize: theme.typography.fontSizeXl, fontWeight: 'bold' }}>
              {t('management.question')}
            </div>
            <div className="flex flex-row p-0 m-0">
              <div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}>
                <RadioButton inputId="inputLow" name="input" value="Low"
                  onChange={(e: RadioButtonChangeEvent) => setInput(e.value, 'L')}
                  checked={input === 'Low'} />
              </div>
              <div className="card p-1 m-0 col-11">
                {t('management.lowInput')}
              </div>
            </div>
            <div className="flex flex-row p-0 m-0">
              <div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}>
                <RadioButton inputId="inputHigh" name="input" value="High"
                  onChange={(e: RadioButtonChangeEvent) => setInput(e.value, 'H')}
                  checked={input === 'High'} />
              </div>
              <div className="card p-1 m-0 col-11">
                {t('management.highInput')}
              </div>
            </div>
            <Divider />
            <div className="flex flex-row">
              <div className="flex col-6">
                <b>{t('management.questionnaire.intro')}</b>
              </div>
              <div className="flex col-6">
                <CancelButton onClick={() => setDontKnow(true)} style={{ fontSize: theme.typography.fontSizeLg }}>{t('management.questionnaire.title')}</CancelButton>
              </div>
            </div>
          </div>
        </div>
      )}
      {dontKnow && (
        <>
          <div className="card">
            <h2 className="m-0 p-0">
              <div className="m-0 p-0 flex flex-row justify-content-start">
                <img src={`${process.env.PUBLIC_URL}/images/QuestionnaireIcon.png`} alt="Questionnaire" style={{ height: '30px', marginRight: '10px' }} />
                {t('management.questionnaire.title')}
              </div>
            </h2>
            {QUESTIONS.map(({ key, name, items }) => (
              <React.Fragment key={name}>
                <div className="card p-1 m-0" style={{ fontSize: theme.typography.fontSizeMd }}><b>{t(`management.questionnaire.${key}`)}</b></div>
                <div className="card p-1 m-0 w-full">
                  <div className="p-0 m-0 flex flex-row gap-1">
                    {items.map((item) => (
                      <div key={item.key} className="flex align-items-center w-full">
                        <RadioButton
                          inputId={`${name}-${item.value}`} name={name} value={item.value}
                          onChange={(e: RadioButtonChangeEvent) => setAnswer(name, e.value)}
                          checked={answers[name] === item.value}
                        />
                        <label htmlFor={`${name}-${item.value}`} className="ml-2">{t(`management.questionnaire.${item.key}`)}</label>
                      </div>
                    ))}
                  </div>
                  {/*<hr />*/}
                </div>
              </React.Fragment>
            ))}
          </div>
          <div className="flex align-items-center justify-content-center" style={{ width: '100%' }}>
            <CancelButton onClick={calculate} style={{ width: '80%', fontSize: theme.typography.fontSizeLg }}>
              {t('management.questionnaire.back')}
            </CancelButton>
          </div>
        </>
      )}
      <SubmitButton
        onClick={() => dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'Results & Report' })}
        disabled={input === '' || irrigation === ''}
        style={{ fontSize: theme.typography.fontSizeLg }}
      >
        {t('management.questionnaire.submit')}
      </SubmitButton>
    </>
  );
};
