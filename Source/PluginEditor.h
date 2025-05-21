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


enum TimerIds
{
    DisplayRefresh,
    ControlRefresh
};

//==============================================================================
/**
*/
class HyperMemoAudioProcessorEditor  : public juce::AudioProcessorEditor, private juce::MultiTimer
{
public:
    HyperMemoAudioProcessorEditor (HyperMemoAudioProcessor&);
    ~HyperMemoAudioProcessorEditor() override;

    //==============================================================================
    void paint (juce::Graphics&) override;
    void resized() override;

    void timerCallback(int timerID) override;
private:
    HyperMemoAudioProcessor& audioProcessor;
    juce::ValueTree& state;
    juce::UndoManager& undoManager;
    int editNoteNumberMemo = -1;
    bool canUndoMemo = false;
    bool canRedoMemo = false;

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
            .withInitialisationData("mode", audioProcessor.getState("mode"))
            .withInitialisationData("fullScreen", audioProcessor.getState("fullScreen"))
            .withInitialisationData("editNoteNumber", audioProcessor.getState("editNoteNumber"))
            .withInitialisationData("fontColor", audioProcessor.getState("fontColor"))
            .withInitialisationData("bgColor", audioProcessor.getState("bgColor"))
            .withInitialisationData("fontSize", audioProcessor.getState("fontSize"))
            .withInitialisationData("fontName", audioProcessor.getState("fontName"))
            .withInitialisationData("fontWeight", audioProcessor.getState("fontWeight"))
            .withInitialisationData("textAlign", audioProcessor.getState("textAlign"))
            .withInitialisationData("texts", audioProcessor.getState("texts"))
            .withNativeFunction("undo",
                [safe_this = juce::Component::SafePointer(this)](auto& var, auto complete)
                {
                    safe_this->undoManager.undo();
                    complete(true);
                }
            )
            .withNativeFunction("redo",
                [safe_this = juce::Component::SafePointer(this)](auto& var, auto complete)
                {
                    safe_this->undoManager.redo();
                    complete(true);
                }
            )
            .withNativeFunction("loadState",
                [safe_this = juce::Component::SafePointer(this)](auto& var, auto complete)
                {
                    auto id = var[0].toString();
                    DBG("loadState: " << id);
                    if (safe_this->audioProcessor.hasState(id))
                    {
                        //DBG(safe_this->getState(id).toString());
                        complete(safe_this->audioProcessor.getState(id));
                    } else {
                        DBG("haven't state: " << id);
                        jassertfalse;
                    }
                }
            )
            .withNativeFunction("changeState",
                [safe_this = juce::Component::SafePointer(this)](auto& var, auto complete)
                {
                    auto id = var[0].toString();
                    DBG("changeState: " << id);
                    if (safe_this->audioProcessor.hasState(id)) {
                        safe_this->audioProcessor.setState(id, var[1]);
                        complete(true);
                    } else {
                        DBG("hasn't state: " << id);
                        jassertfalse;
                    }
                }
            )
            .withNativeFunction("openInBrowser",
                [safe_this = juce::Component::SafePointer(this)](auto& var, auto complete)
                {
                    auto _href = var[0].toString();
                    DBG("openInBrowser: " << _href);
                    const auto href = juce::URL{ _href };
                    href.launchInDefaultBrowser();
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
