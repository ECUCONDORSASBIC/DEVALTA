import React from 'react';
import { useAnamnesisStore } from '../stores/anamnesisStore';
import { Question } from '../../lib/clinical-decision/types';

interface AdaptiveQuestionsPanelProps {
  questions: Question[];
}

const AdaptiveQuestionsPanel: React.FC<AdaptiveQuestionsPanelProps> = ({ questions }) => {
  const updateAdaptiveAnswer = useAnamnesisStore((state) => state.actions.updateAdaptiveAnswer);
  const personalData = useAnamnesisStore((state) => state.personalData);
  const isPediatric = personalData?.age && personalData.age < 18;

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'slider':
        const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value;
          if (!question.required || value) {
            updateAdaptiveAnswer(question.id, value);
          }
        };
        return (
          <div key={question.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {question.text}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
              <input
                type="range"
                min={question.range?.min}
                max={question.range?.max}
                step={question.range?.step}
                onChange={handleSliderChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{question.range?.min}</span>
                <span>{question.range?.max}</span>
              </div>
            </div>
          </div>
        );
      case 'checkbox':
        const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const checked = e.target.checked;
          if (!question.required || checked) {
            updateAdaptiveAnswer(question.id, checked);
          }
        };
        return (
          <div key={question.id} className="flex items-start">
            <input 
              type="checkbox" 
              onChange={handleCheckboxChange}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-3 text-sm text-gray-700">
              {question.text}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          </div>
        );
      case 'radio':
        return (
          <div key={question.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {question.text}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {question.options?.map((option) => (
                <div key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name={question.id}
                    value={option.value}
                    onChange={(e) => updateAdaptiveAnswer(question.id, option.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label className="ml-3 text-sm text-gray-700">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );
      case 'text':
        const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value;
          if (!question.required || value.trim() !== "") {
            updateAdaptiveAnswer(question.id, value);
          }
        };
        return (
          <div key={question.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {question.text}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input 
              type="text" 
              onChange={handleTextChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={isPediatric ? "Escriba aquí..." : "Ingrese su respuesta..."}
            />
          </div>
        );
      case 'multiselect':
        return (
          <div key={question.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {question.text}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {question.options?.map((option) => (
                <div key={option.value} className="flex items-start">
                  <input
                    type="checkbox"
                    value={option.value}
                    onChange={(e) => updateAdaptiveAnswer(question.id, e.target.checked ? option.value : null)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-3 text-sm text-gray-700">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {questions.length === 0 ? (
        <p className="text-sm text-gray-500 italic">
          No hay preguntas adicionales en este momento.
        </p>
      ) : (
        <>
          {isPediatric && (
            <div className="bg-purple-100 border border-purple-300 rounded-lg p-3 mb-4">
              <p className="text-sm text-purple-800">
                <span className="font-medium">🧸 Nota:</span> Estas preguntas están adaptadas para casos pediátricos.
              </p>
            </div>
          )}
          {questions.map(renderQuestion)}
        </>
      )}
    </div>
  );
};

export default AdaptiveQuestionsPanel;

