/*
  ==============================================================================

    This file contains the basic framework code for a JUCE plugin editor.

  ==============================================================================
*/

#pragma once

#include <JuceHeader.h>

class WebBrowserComponentTS : public juce::WebBrowserComponent {
public:
    //class Options : public juce::WebBrowserComponent::Options
    //{
    //public:
    //    Options withNativeFunction(const juce::Identifier& name, NativeFunction callback) {
    //        juce::WebBrowserComponent::Options::withNativeFunction(name, callback);
    //    }
    //};

    WebBrowserComponentTS(
        const juce::String& typesDir,
        const juce::String& typesFile,
        const juce::String& moduleName,
        WebBrowserComponent::Options& options
    ) : WebBrowserComponent::WebBrowserComponent(options) {
        DBG("hello typescript!");
        const auto typesFilePath = juce::File{ typesDir }.getChildFile(typesFile);
        DBG(typesFilePath.getFullPathName());
        const auto result = typesFilePath.create();

        if (result.ok) {
            typesFilePath.replaceWithText(createDts(moduleName, options));
        }
        else {
            DBG("failed create types file");
        }
    }

    static juce::File getSourcePath(juce::String childPath = "./") {
        auto start = juce::File::getSpecialLocation(juce::File::currentExecutableFile);
        while (start.exists() && !start.isRoot() && start.getFileName() != "Builds")
            start = start.getParentDirectory();

        if (start.getFileName() == "Builds") {
            auto sources = start.getSiblingFile("Source");
            if (sources.isDirectory())
                return sources.getChildFile(childPath);
        }
    }

private:
    juce::String createDts(
        const juce::String& moduleName,
        const WebBrowserComponent::Options& options
    ) {
        auto functionNames = juce::StringArray{};
        const auto nativeFunctions = options.getNativeFunctions();
        DBG("getNativeFunctions");
        DBG(nativeFunctions.size());
        for (const auto& [id, func] : nativeFunctions) {
            functionNames.add(id.toString());
            DBG("id: " << id);
            DBG(func.target_type().name());
        }

        //auto listenerNames = juce::StringArray{};
        //const auto eventListeners = options.getEventListeners();
        //DBG("getEventListeners");
        //DBG(eventListeners.size());
        //for (const auto& [id, listener]: eventListeners) {
        //    listenerNames.add(id.toString());
        //}

        return juce::StringArray{
            "/* eslint-disable @typescript-eslint/no-explicit-any */",
            "",
            "/*",
            "This file was automatically created by the WebBrowserComponentTS program.",
            "Detailed documentation is here, TODO",
            "*/",
            "",
            "declare module '" + moduleName + "' {",
            functionNames.size() > 0 ? (
                "  function getNativeFunction(name: '" +
                functionNames.joinIntoString("' | '") +
                "'): (...args: any[]) => Promise<any>;"
            ) : "",
            "}",
            ""
        }.joinIntoString(juce::newLine);
    }
};
