/*
  ==============================================================================

    This file contains the basic framework code for a JUCE plugin editor.

  ==============================================================================
*/

#include "PluginProcessor.h"
#include "PluginEditor.h"

//==============================================================================
HyperMemoAudioProcessorEditor::HyperMemoAudioProcessorEditor (HyperMemoAudioProcessor& p)
    : AudioProcessorEditor (&p), audioProcessor (p), state(p.state)
{
    // Make sure that before the constructor has finished, you've set the
    // editor's size to whatever you need it to be.
    auto size = p.getSavedSize();
    setSize(size.x, size.y);
    setResizeLimits(400, 300, 3840, 2160);
    setResizable(true, true);

    addAndMakeVisible(webComponent);
    webComponent.goToURL (localDevServerAddress);
    //webComponent.goToURL(juce::WebBrowserComponent::getResourceProviderRoot());

}

HyperMemoAudioProcessorEditor::~HyperMemoAudioProcessorEditor()
{
}

//==============================================================================
//void HyperMemoAudioProcessorEditor::paint (juce::Graphics& g)
//{
//    // (Our component is opaque, so we must completely fill the background with a solid colour)
//    g.fillAll (getLookAndFeel().findColour (juce::ResizableWindow::backgroundColourId));
//
//    g.setColour (juce::Colours::white);
//    g.setFont (juce::FontOptions (15.0f));
//    juce::StringArray strs{
//        "pos: " + juce::String { floor(audioProcessor.ppqPosition) },
//        "timeInSeconds: " + juce::String { floor(audioProcessor.timeInSeconds / 1000) },
//    };
//    g.drawFittedText(strs.joinIntoString("\n"), getLocalBounds(), juce::Justification::centred, strs.size());
//}

void HyperMemoAudioProcessorEditor::paint(juce::Graphics& g) {
    g.fillAll(getLookAndFeel().findColour(juce::ResizableWindow::backgroundColourId));
}

void HyperMemoAudioProcessorEditor::resized() {
    webComponent.setBounds(getLocalBounds());
    audioProcessor.setSavedSize({ getWidth(), getHeight() });
}

bool HyperMemoAudioProcessorEditor::hasState(juce::String id)
{
  return
    id == "mode" ||
    id == "fullScreen" ||
    id == "bgColor" ||
    id == "fontColor" ||
    id == "fontSize" ||
    id == "textAlign" ||
    id == "editNoteNumber";
    //id == "texts";
}

juce::var HyperMemoAudioProcessorEditor::getState(juce::String id)
{
  return state.getProperty(id);
}

void HyperMemoAudioProcessorEditor::setState(juce::String id, const juce::var& newValue)
{
  state.setProperty(id, newValue, nullptr);
}

std::optional<juce::WebBrowserComponent::Resource>
HyperMemoAudioProcessorEditor::getResource(const juce::String& url) {
    const auto urlToRetrive = url == "/"
        ? juce::String{ "index.html" }
    : url.fromFirstOccurrenceOf("/", false, false);

    //static auto streamZip = juce::MemoryInputStream(
    //    juce::MemoryBlock(BinaryData::assets_zip, BinaryData::assets_zipSize),
    //    true);

    //static juce::ZipFile archive{streamZip};

    //if (auto* entry = archive.getEntry(urlToRetrive)) {
    //  auto entryStream = rawToUniquePtr(archive.createStreamForEntry(*entry));
    //  std::vector<std::byte> result((size_t)entryStream->getTotalLength());
    //  entryStream->setPosition(0);
    //  entryStream->read(result.data(), result.size());

    //  auto mime = getMimeForExtension(
    //      entry->filename.fromLastOccurrenceOf(".", false, false).toLowerCase());
    //  return juce::WebBrowserComponent::Resource{std::move(result),
    //                                             std::move(mime)};
    //}
    return std::nullopt;
}

const char* HyperMemoAudioProcessorEditor::getMimeForExtension(
    const juce::String& extension) {
    static const std::unordered_map<juce::String, const char*> mimeMap = {
        {{"htm"}, "text/html"},
        {{"html"}, "text/html"},
        {{"txt"}, "text/plain"},
        {{"jpg"}, "image/jpeg"},
        {{"jpeg"}, "image/jpeg"},
        {{"svg"}, "image/svg+xml"},
        {{"ico"}, "image/vnd.microsoft.icon"},
        {{"json"}, "application/json"},
        {{"png"}, "image/png"},
        {{"css"}, "text/css"},
        {{"map"}, "application/json"},
        {{"js"}, "text/javascript"},
        {{"woff2"}, "font/woff2"} };

    if (const auto it = mimeMap.find(extension.toLowerCase());
        it != mimeMap.end())
        return it->second;

    jassertfalse;
    return "";
}
