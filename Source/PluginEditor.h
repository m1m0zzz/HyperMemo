/*
  ==============================================================================

    This file contains the basic framework code for a JUCE plugin editor.

  ==============================================================================
*/

#pragma once

#include <JuceHeader.h>
#include "PluginProcessor.h"
#include "WebBrowserComponentTS.h"

#if JUCE_ANDROID
// The localhost is available on this address to the emulator
const juce::String localDevServerAddress = "http://10.0.2.2:5173/";
#else
const juce::String localDevServerAddress = "http://localhost:5173/";
#endif

// struct SinglePageBrowser : public WebBrowserComponentTS {
//     using WebBrowserComponentTS::WebBrowserComponentTS;

//     // Prevent page loads from navigating away from our single page web app
//     bool pageAboutToLoad(const juce::String& newURL) override {
//         return newURL == localDevServerAddress || newURL == getResourceProviderRoot();
//     }
// };

struct SinglePageBrowser : public juce::WebBrowserComponent {
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
    juce::UndoManager& undoManager;
    int editNoteNumberMemo = -1;

    juce::WebControlParameterIndexReceiver controlParameterIndexReceiver;

    SinglePageBrowser webComponent{
        // WebBrowserComponentTS::getSourcePath("../webview/src/types").getFullPathName(),
        // "juce.d.ts",
        // "juce-framework-frontend-mirror",
        juce::WebBrowserComponent::Options{}
        .withBackend(juce::WebBrowserComponent::Options::Backend::webview2)
        .withWinWebView2Options(
            juce::WebBrowserComponent::Options::WinWebView2{}
            .withUserDataFolder(juce::File::getSpecialLocation(
                juce::File::SpecialLocationType::tempDirectory))
            )
            //.withOptionsFrom(gainRelay)
            .withOptionsFrom(controlParameterIndexReceiver)
            .withInitialisationData("mode", getState("mode"))
            .withInitialisationData("fullScreen", getState("fullScreen"))
            .withInitialisationData("editNoteNumber", getState("editNoteNumber"))
            .withInitialisationData("fontColor", getState("fontColor"))
            .withInitialisationData("bgColor", getState("bgColor"))
            .withInitialisationData("fontSize", getState("fontSize"))
            .withInitialisationData("fontName", getState("fontName"))
            .withInitialisationData("fontWeight", getState("fontWeight"))
            .withInitialisationData("textAlign", getState("textAlign"))
            .withInitialisationData("texts", getState("texts"))
            .withNativeFunction("loadState",
                [safe_this = juce::Component::SafePointer(this)](auto& var, auto complete)
                {
                    auto id = var[0].toString();
                    DBG("loadState: " << id);
                    if (safe_this->hasState(id))
                    {
                        //DBG(safe_this->getState(id).toString());
                        complete(safe_this->getState(id));
                    } else {
                        jassert("hasn't state: ", id);
                    }
                }
            )
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
                                line.setProperty("text", texts[i], &safe_this->undoManager);
                            } else {
                                auto line = juce::ValueTree{ "Line", { { "index", i }, { "text", text.toString() }}};
                                textData.addChild(line, i, &safe_this->undoManager);
                            }
                        }
                        complete(true);
                    } else {
                        complete(false);
                        jassert("hasn't state: ", id);
                    }
                }
            )
            .withResourceProvider(
                [this](const auto& url) { return getResource(url); },
                juce::URL{ localDevServerAddress }.getOrigin()
            )
    };

    std::optional<juce::WebBrowserComponent::Resource> getResource(const juce::String& url);

    const char* getMimeForExtension(const juce::String& extension);

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (HyperMemoAudioProcessorEditor)
};
