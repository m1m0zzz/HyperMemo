/*
  ==============================================================================

    This file contains the basic framework code for a JUCE plugin editor.

  ==============================================================================
*/

#include "PluginProcessor.h"
#include "PluginEditor.h"

#ifdef DEBUG
#define WEB_VIEW_FROM_DEV_SERVER 1
#else
#define WEB_VIEW_FROM_DEV_SERVER 0
#endif // DEBUG


//==============================================================================
HyperMemoAudioProcessorEditor::HyperMemoAudioProcessorEditor (HyperMemoAudioProcessor& p)
    : AudioProcessorEditor (&p), audioProcessor (p), state(p.state), undoManager(p.undoManager)
{
    auto size = p.getSavedSize();
    setSize(size.x, size.y);
    setResizeLimits(550, 500, 3840, 2160);
    setResizable(true, true);

    addAndMakeVisible(webComponent);

    startTimer(TimerIds::DisplayRefresh, 1000 / 30);
    startTimer(TimerIds::ControlRefresh, 1000);

#if WEB_VIEW_FROM_DEV_SERVER
    webComponent.goToURL(localDevServerAddress);
#else
    webComponent.goToURL(juce::WebBrowserComponent::getResourceProviderRoot());
#endif
}

HyperMemoAudioProcessorEditor::~HyperMemoAudioProcessorEditor()
{
}

//==============================================================================
void HyperMemoAudioProcessorEditor::paint(juce::Graphics& g) {
    g.fillAll(getLookAndFeel().findColour(juce::ResizableWindow::backgroundColourId));
}

void HyperMemoAudioProcessorEditor::resized() {
    webComponent.setBounds(getLocalBounds());
    audioProcessor.setSavedSize({ getWidth(), getHeight() });
}

void HyperMemoAudioProcessorEditor::timerCallback(int timerID)
{
    if (timerID == TimerIds::DisplayRefresh) {
        const auto editNumber = audioProcessor.getEditNoteNumber();
        if (editNoteNumberMemo != editNumber) {
            webComponent.emitEventIfBrowserIsVisible("onChangeEditNoteNumber", juce::var{ editNumber });
            editNoteNumberMemo = editNumber;
        }

        const auto canUndo = undoManager.canUndo();
        const auto canRedo = undoManager.canRedo();
        if (canUndoMemo != canUndo || canRedoMemo != canRedo) {
            //DBG("canUndo or canRedo");
            //DBG(juce::var{ canUndo }.toString());
            //DBG(juce::var{ canRedo }.toString());
            webComponent.emitEventIfBrowserIsVisible(
                "onChangeCanUndoOrRedo",
                juce::Array<juce::var> { juce::var{ canUndo }, juce::var{ canRedo } }
            );
            canUndoMemo = canUndo;
            canRedoMemo = canRedo;
        }
    }
    else if (timerID == TimerIds::ControlRefresh) {
        undoManager.beginNewTransaction();
    }
}

static auto streamToVector(juce::InputStream& stream)
{
    std::vector<std::byte> result((size_t)stream.getTotalLength());
    stream.setPosition(0);
    [[maybe_unused]] const auto bytesRead = stream.read(result.data(), result.size());
    //jassert(bytesRead == (ssize_t)result.size());
    return result;
}

std::optional<juce::WebBrowserComponent::Resource>
HyperMemoAudioProcessorEditor::getResource(const juce::String& url) {
    const auto urlToRetrive = url == "/"
        ? juce::String{ "index.html" }
    : url.fromFirstOccurrenceOf("/", false, false);

    static auto streamZip = juce::MemoryInputStream(
        juce::MemoryBlock(BinaryData::webview_zip, BinaryData::webview_zipSize),
        true);

    static juce::ZipFile archive{streamZip};

    if (auto* entry = archive.getEntry(urlToRetrive)) {
      auto entryStream = rawToUniquePtr(archive.createStreamForEntry(*entry));
      std::vector<std::byte> result((size_t)entryStream->getTotalLength());
      entryStream->setPosition(0);
      entryStream->read(result.data(), result.size());

      auto mime = getMimeForExtension(
          entry->filename.fromLastOccurrenceOf(".", false, false).toLowerCase());
      return juce::WebBrowserComponent::Resource{std::move(result),
                                                 std::move(mime)};
    }
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
