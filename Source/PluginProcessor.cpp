/*
  ==============================================================================

    This file contains the basic framework code for a JUCE plugin processor.

  ==============================================================================
*/

#include "PluginProcessor.h"
#include "PluginEditor.h"

//==============================================================================
HyperMemoAudioProcessor::HyperMemoAudioProcessor()
#ifndef JucePlugin_PreferredChannelConfigurations
  : AudioProcessor (BusesProperties()
    #if ! JucePlugin_IsMidiEffect
    #if ! JucePlugin_IsSynth
      .withInput  ("Input",  juce::AudioChannelSet::stereo(), true)
    #endif
      .withOutput ("Output", juce::AudioChannelSet::stereo(), true)
    #endif
      )
#endif
  ,
  parameters(*this, &undoManager, juce::Identifier("parameters"), {}),
  state(
    "States",
    {
      // app state
      { "mode", "midi" },
      { "fullScreen", false },
      { "editNoteNumber", 0 },
      // config
      { "fontColor", "#000000" },
      { "bgColor", "#ffffff" },
      { "fontSize", 32 },
      { "fontName", "system-ui"},
      { "textAlign", "center" },
    },
    {
      { "TextData", {},
        {
          { "Line", {
            { "index", 0 },
            { "text", "sample text" }
          }},
          { "Line", {
            { "index", 1 },
            { "text", "sample text 2" }
          }},
        }
      }
    }
  )
{
    //juce::StringArray texts;
    //for (size_t i = 0; i < MAX_MIDI_NOTE_NUMS; i++) {
    //  texts.add("");
    //}
    //state.setProperty("texts", juce::var{ texts }, nullptr);
    DBG("===");
    DBG(state.getProperty("mode").toString());
    DBG(state.getProperty("fullScreen").toString());
    DBG(state.getProperty("editNoteNumber").toString());
    DBG(state.getProperty("fontColor").toString());
    DBG(state.getProperty("bgColor").toString());
    DBG(state.getProperty("fontSize").toString());
    DBG(state.getProperty("textAlign").toString());
    //DBG(state.getProperty("texts").toString());
    //DBG(state.getProperty("texts")[0].toString());
    //DBG(state.getProperty("texts")[1].toString());
    const auto textData = state.getChildWithName("TextData");
    DBG(textData.getNumChildren());
    DBG(textData.toXmlString());
    for (auto it = textData.begin(); it != textData.end(); ++it) {
        auto line = *it;
        int index = line.getProperty("index");
        juce::String text = line.getProperty("text");
        DBG("[" << index << "]");
        DBG(text);
    }
}

HyperMemoAudioProcessor::~HyperMemoAudioProcessor()
{
}

//==============================================================================
const juce::String HyperMemoAudioProcessor::getName() const
{
    return JucePlugin_Name;
}

bool HyperMemoAudioProcessor::acceptsMidi() const
{
   #if JucePlugin_WantsMidiInput
    return true;
   #else
    return false;
   #endif
}

bool HyperMemoAudioProcessor::producesMidi() const
{
   #if JucePlugin_ProducesMidiOutput
    return true;
   #else
    return false;
   #endif
}

bool HyperMemoAudioProcessor::isMidiEffect() const
{
   #if JucePlugin_IsMidiEffect
    return true;
   #else
    return false;
   #endif
}

double HyperMemoAudioProcessor::getTailLengthSeconds() const
{
    return 0.0;
}

int HyperMemoAudioProcessor::getNumPrograms()
{
    return 1;   // NB: some hosts don't cope very well if you tell them there are 0 programs,
                // so this should be at least 1, even if you're not really implementing programs.
}

int HyperMemoAudioProcessor::getCurrentProgram()
{
    return 0;
}

void HyperMemoAudioProcessor::setCurrentProgram (int index)
{
}

const juce::String HyperMemoAudioProcessor::getProgramName (int index)
{
    return {};
}

void HyperMemoAudioProcessor::changeProgramName (int index, const juce::String& newName)
{
}

//==============================================================================
void HyperMemoAudioProcessor::prepareToPlay (double sampleRate, int samplesPerBlock)
{
    // Use this method as the place to do any pre-playback
    // initialisation that you need..
}

void HyperMemoAudioProcessor::releaseResources()
{
    // When playback stops, you can use this as an opportunity to free up any
    // spare memory, etc.
}

#ifndef JucePlugin_PreferredChannelConfigurations
bool HyperMemoAudioProcessor::isBusesLayoutSupported (const BusesLayout& layouts) const
{
  #if JucePlugin_IsMidiEffect
    juce::ignoreUnused (layouts);
    return true;
  #else
    // This is the place where you check if the layout is supported.
    // In this template code we only support mono or stereo.
    // Some plugin hosts, such as certain GarageBand versions, will only
    // load plugins that support stereo bus layouts.
    if (layouts.getMainOutputChannelSet() != juce::AudioChannelSet::mono()
     && layouts.getMainOutputChannelSet() != juce::AudioChannelSet::stereo())
        return false;

    // This checks if the input layout matches the output layout
   #if ! JucePlugin_IsSynth
    if (layouts.getMainOutputChannelSet() != layouts.getMainInputChannelSet())
        return false;
   #endif

    return true;
  #endif
}
#endif

void HyperMemoAudioProcessor::processBlock (juce::AudioBuffer<float>& buffer, juce::MidiBuffer& midiMessages)
{
    juce::ScopedNoDenormals noDenormals;
    //auto totalNumInputChannels  = getTotalNumInputChannels();
    //auto totalNumOutputChannels = getTotalNumOutputChannels();

    playHead = this->getPlayHead();
    playHead->getCurrentPosition(currentPositionInfo);
    ppqPosition = currentPositionInfo.ppqPosition;
    timeInSeconds = currentPositionInfo.timeInSamples;

    // midi trigger mode
    int lastHitNoteNumber = -1;
    for (const auto metadata : midiMessages) {
        auto message = metadata.getMessage();
        if (message.isNoteOn()) {
            lastHitNoteNumber = message.getNoteNumber();
            //DBG(message.getMidiNoteName(message.getNoteNumber(), true, true, 4));
        }
    }
    if (lastHitNoteNumber != -1) {
        editNoteNumber = lastHitNoteNumber;
    }
}

//==============================================================================
bool HyperMemoAudioProcessor::hasEditor() const
{
    return true; // (change this to false if you choose to not supply an editor)
}

juce::AudioProcessorEditor* HyperMemoAudioProcessor::createEditor()
{
    return new HyperMemoAudioProcessorEditor (*this);
}

//==============================================================================
void HyperMemoAudioProcessor::getStateInformation (juce::MemoryBlock& destData)
{
    // You should use this method to store your parameters in the memory block.
    // You could do that either as raw data, or use the XML or ValueTree classes
    // as intermediaries to make it easy to save and load complex data.
    auto editor = state.getOrCreateChildWithName("editor", nullptr);
    editor.setProperty("sizeX", editorSize.x, nullptr);
    editor.setProperty("sizeY", editorSize.y, nullptr);

    juce::MemoryOutputStream stream(destData, false);
    state.writeToStream(stream);
}

void HyperMemoAudioProcessor::setStateInformation (const void* data, int sizeInBytes)
{
    // You should use this method to restore your parameters from this memory block,
    // whose contents will have been created by the getStateInformation() call.
    juce::ValueTree tree = juce::ValueTree::readFromData(data, sizeInBytes);
    if (tree.isValid()) {
        state = tree;
        auto editor = state.getChildWithName("editor");
        if (editor.isValid()) {
            editorSize.setX(editor.getProperty("sizeX", 1280));
            editorSize.setY(editor.getProperty("sizeY", 720));
            if (auto* activeEditor = getActiveEditor()) {
                activeEditor->setSize(editorSize.x, editorSize.y);
            }
        }
    } else {
        editorSize.setX(1280);
        editorSize.setY(720);
    }
}

//==============================================================================
// This creates new instances of the plugin..
juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter()
{
    return new HyperMemoAudioProcessor();
}

juce::Point<int> HyperMemoAudioProcessor::getSavedSize() const
{
    return editorSize;
}

void HyperMemoAudioProcessor::setSavedSize(const juce::Point<int>& size)
{
    editorSize = size;
}

int HyperMemoAudioProcessor::getEditNoteNumber() const
{
    return editNoteNumber;
}
