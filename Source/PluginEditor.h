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
class HyperMemoAudioProcessorEditor  : public juce::AudioProcessorEditor
{
public:
    HyperMemoAudioProcessorEditor (HyperMemoAudioProcessor&);
    ~HyperMemoAudioProcessorEditor() override;

    //==============================================================================
    void paint (juce::Graphics&) override;
    void resized() override;

private:
    // This reference is provided as a quick way for your editor to
    // access the processor object that created it.
    HyperMemoAudioProcessor& audioProcessor;

    juce::WebControlParameterIndexReceiver controlParameterIndexReceiver;

    SinglePageBrowser webComponent{
     juce::WebBrowserComponent::Options{}
         .withBackend(juce::WebBrowserComponent::Options::Backend::webview2)
         .withWinWebView2Options(
             juce::WebBrowserComponent::Options::WinWebView2{}
                 .withUserDataFolder(juce::File::getSpecialLocation(
                     juce::File::SpecialLocationType::tempDirectory)))
         //.withOptionsFrom(gainRelay)
         .withOptionsFrom(controlParameterIndexReceiver)
        /*.withResourceProvider(
            [this](const auto& url) { return getResource(url); },
            juce::URL{"http://localhost:5173/"}.getOrigin())*/
    };

    std::optional<juce::WebBrowserComponent::Resource> getResource(
        const juce::String& url);

    const char* getMimeForExtension(const juce::String& extension);

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (HyperMemoAudioProcessorEditor)
};
