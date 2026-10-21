import React, { createContext, useContext, useState, useEffect } from "react";
import { collegeService } from "../services/collegeService";
import { INITIAL_COLLEGE_SETTINGS } from "../services/seedData";

const CollegeContext = createContext(null);

export const CollegeProvider = ({ children }) => {
  const [settings, setSettings] = useState(INITIAL_COLLEGE_SETTINGS);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCollegeData = async () => {
    try {
      const [s, d, c, sub] = await Promise.all([
        collegeService.getSettings(),
        collegeService.getDepartments(),
        collegeService.getClasses(),
        collegeService.getSubjects(),
      ]);
      if (s) setSettings(s);
      setDepartments(d || []);
      setClasses(c || []);
      setSubjects(sub || []);
    } catch (err) {
      console.warn("College data load notice:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollegeData();

    // Listen for updates in storage
    const handleSettingsUpdate = () => loadCollegeData();
    window.addEventListener("campusconnect_settings_updated", handleSettingsUpdate);
    window.addEventListener("campusconnect_departments_updated", handleSettingsUpdate);
    window.addEventListener("campusconnect_classes_updated", handleSettingsUpdate);
    window.addEventListener("campusconnect_subjects_updated", handleSettingsUpdate);

    return () => {
      window.removeEventListener("campusconnect_settings_updated", handleSettingsUpdate);
      window.removeEventListener("campusconnect_departments_updated", handleSettingsUpdate);
      window.removeEventListener("campusconnect_classes_updated", handleSettingsUpdate);
      window.removeEventListener("campusconnect_subjects_updated", handleSettingsUpdate);
    };
  }, []);

  const updateSettings = async (newSettings) => {
    const updated = await collegeService.updateSettings(newSettings);
    setSettings(updated);
    return updated;
  };

  return (
    <CollegeContext.Provider
      value={{
        settings,
        departments,
        classes,
        subjects,
        loading,
        refreshCollegeData: loadCollegeData,
        updateSettings,
      }}
    >
      {children}
    </CollegeContext.Provider>
  );
};

export const useCollege = () => {
  const context = useContext(CollegeContext);
  if (!context) {
    throw new Error("useCollege must be used within a CollegeProvider");
  }
  return context;
};
