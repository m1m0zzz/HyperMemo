/*
  ==============================================================================

    This file contains the basic framework code for a JUCE plugin processor.

  ==============================================================================
*/

#pragma once

#include <JuceHeader.h>

const int MAX_MIDI_NOTE_NUMS = 128;

//==============================================================================
/**
*/
class HyperMemoAudioProcessor  : public juce::AudioProcessor
{
public:
    //==============================================================================
    HyperMemoAudioProcessor();
    ~HyperMemoAudioProcessor() override;

    //==============================================================================
    void prepareToPlay (double sampleRate, int samplesPerBlock) override;
    void releaseResources() override;

   #ifndef JucePlugin_PreferredChannelConfigurations
    bool isBusesLayoutSupported (const BusesLayout& layouts) const override;
   #endif

    void processBlock (juce::AudioBuffer<float>&, juce::MidiBuffer&) override;

    //==============================================================================
    juce::AudioProcessorEditor* createEditor() override;
    bool hasEditor() const override;

    //==============================================================================
    const juce::String getName() const override;

    bool acceptsMidi() const override;
    bool producesMidi() const override;
    bool isMidiEffect() const override;
    double getTailLengthSeconds() const override;

    //==============================================================================
    int getNumPrograms() override;
    int getCurrentProgram() override;
    void setCurrentProgram (int index) override;
    const juce::String getProgramName (int index) override;
    void changeProgramName (int index, const juce::String& newName) override;

    //==============================================================================
    void getStateInformation (juce::MemoryBlock& destData) override;
    void setStateInformation (const void* data, int sizeInBytes) override;

    //==============================================================================
    juce::Point<int> getSavedSize() const;
    void setSavedSize(const juce::Point<int>& size);
    int getEditNoteNumber() const;

    bool hasState(juce::String id);
    juce::var getState(juce::String id);
    void setState(juce::String id, const juce::var& newValue);

    //==============================================================================
    juce::ValueTree state;
    juce::ValueTree controlledState; // undoManager によって制御する state
    juce::UndoManager undoManager{ 100, 30 };
private:
    //juce::AudioProcessorValueTreeState parameters;

    juce::AudioPlayHead* playHead = nullptr;
    juce::AudioPlayHead::CurrentPositionInfo currentPositionInfo;

    juce::Point<int> editorSize{ 1280, 720 };

    double ppqPosition = 0.0;
    double timeInSeconds = 0.0;
    int editNoteNumber = -1;

    //==============================================================================
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (HyperMemoAudioProcessor)
};
