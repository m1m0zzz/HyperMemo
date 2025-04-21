/*
  ==============================================================================

    This file contains the basic framework code for a JUCE plugin editor.

  ==============================================================================
*/

#pragma once

#include <JuceHeader.h>
#include "PluginProcessor.h"

#if JUCE_ANDROID
// The localhost is available on this address to the emulator
const juce::String localDevServerAddress = "http://10.0.2.2:5173/";
#else
const juce::String localDevServerAddress = "http://localhost:5173/";
#endif

struct SinglePageBrowser : juce::WebBrowserComponent {
    using WebBrowserComponent::WebBrowserComponent;

    // Prevent page loads from navigating away from our single page web app
    bool pageAboutToLoad(const juce::String& newURL) override {
        return newURL == localDevServerAddress || newURL == getResourceProviderRoot();
    }
};

//==============================================================================
/**
*/
class HyperMemoAudioProcessorEditor  : public juce::AudioProcessorEditor, private juce::Timer
{
public:
    HyperMemoAudioProcessorEditor (HyperMemoAudioProcessor&);
    ~HyperMemoAudioProcessorEditor() override;

    //==============================================================================
    void paint (juce::Graphics&) override;
    void resized() override;

    void timerCallback() override;
private:
    bool hasState(juce::String id);
    juce::var getState(juce::String id);
    void setState(juce::String id, const juce::var& newValue);

    HyperMemoAudioProcessor& audioProcessor;
    juce::ValueTree& state;
    int editNoteNumberMemo = -1;

    juce::WebControlParameterIndexReceiver controlParameterIndexReceiver;

    SinglePageBrowser webComponent{
        juce::WebBrowserComponent::Options{}
        .withBackend(juce::WebBrowserComponent::Options::Backend::webview2)
        .withWinWebView2Options(
            juce::WebBrowserComponent::Options::WinWebView2{}
            .withUserDataFolder(juce::File::getSpecialLocation(
                juce::File::SpecialLocationType::tempDirectory))
            )
            //.withOptionsFrom(gainRelay)
            .withOptionsFrom(controlParameterIndexReceiver)
            .withInitialisationData("name", juce::var{ "mimoz" })
            .withInitialisationData("num", juce::var{ 123 })
            .withNativeFunction("loadState",
            [safe_this = juce::Component::SafePointer(this)](auto& var, auto complete)
            {
                auto id = var[0].toString();
                DBG("loadState: " << id);
                if (safe_this->hasState(id)) {
                    DBG(safe_this->getState(id).toString());
                    complete(safe_this->getState(id));
                } else if (id == "texts") {
                    juce::ValueTree textData = safe_this->state.getChildWithName("TextData");
                    juce::StringArray texts;
                    for (size_t i = 0; i < MAX_MIDI_NOTE_NUMS; i++) {
                        texts.add("");
                    }
                    for (auto it = textData.begin(); it != textData.end(); ++it) {
                        auto line = *it;
                        int index = line.getProperty("index");
                        juce::String text = line.getProperty("text");
                        DBG(index << ": " << text);
                        texts.set(index, text);
                    }
                    // TODO: use hash map
                    complete(juce::var{ texts });
                } else {
                    jassert("hasn't state: ", id);
                }
            })
            .withNativeFunction("changeState",
                [safe_this = juce::Component::SafePointer(this)](auto& var, auto complete)
                {
                    auto id = var[0].toString();
                    DBG("changeState: " << id);
                    if (safe_this->hasState(id)) {
                        safe_this->setState(id, var[1]);
                        complete(true);
                    } else if (id == "texts") {
                        DBG("texts");
                        if (!var[1].isArray()) {
                            complete(false);
                            jassert("texts is not Array");
                            return;
                        }
                        juce::ValueTree textData = safe_this->state.getChildWithName("TextData");
                        juce::var texts = var[1];
                        for (int i = 0; i < texts.size(); i++) {
                            auto text = texts[i];
                            //DBG(i << ": " << text.toString());
                            auto line = textData.getChildWithProperty("index", juce::var{ i });
                            if (line.isValid()) {
                                line.setProperty("text", texts[i], nullptr);
                            } else {
                                auto line = juce::ValueTree{ "Line", { { "index", i }, { "text", text.toString() }}};
                                textData.addChild(line, i, nullptr);
                            }
                        }
                        complete(true);
                    } else {
                        complete(false);
                        jassert("hasn't state: ", id);
                    }
                })
            .withResourceProvider(
                [this](const auto& url) { return getResource(url); },
                juce::URL{"http://localhost:5173/"}.getOrigin())
    };

    std::optional<juce::WebBrowserComponent::Resource> getResource(const juce::String& url);

    const char* getMimeForExtension(const juce::String& extension);

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (HyperMemoAudioProcessorEditor)
};
