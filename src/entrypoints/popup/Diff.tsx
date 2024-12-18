import React from "react";
import {
  IExtensionDeveloperInformation
} from "@/utils/interfaces";

interface DiffProps {
  obj1: IExtensionDeveloperInformation;
  obj2: IExtensionDeveloperInformation;
}

interface DiffResult {
  added: Partial<IExtensionDeveloperInformation>;
  removed: Partial<IExtensionDeveloperInformation>;
  unchanged: Partial<IExtensionDeveloperInformation>;
}


const Diff = ({ obj1, obj2 }: DiffProps) => {
  // Function to compare objects and find differences
  const findDifferences = (
      obj1: IExtensionDeveloperInformation,
      obj2: IExtensionDeveloperInformation
  ) => {
    let diff: DiffResult = {
      added: {},
      removed: {},
      unchanged: {},
    };

    (Object.keys(obj1) as (
        keyof IExtensionDeveloperInformation)[]).forEach((key) => {
      if (!obj2.hasOwnProperty(key)) {
        diff.removed[key] = obj1[key];
      } else if (obj1[key] === obj2[key]) {
        diff.unchanged[key] = obj1[key];
      }
    });

    (Object.keys(obj2) as (
        keyof IExtensionDeveloperInformation)[]).forEach((key) => {
      if (!obj1.hasOwnProperty(key)) {
        diff.added[key] = obj2[key];
      } else if (obj1[key] !== obj2[key]) {
        diff.added[key] = obj2[key];
        if (!diff.removed.hasOwnProperty(key)) {
          diff.removed[key] = obj1[key];
        }
      }
    });

    return diff;
  };

  const differences = findDifferences(obj1, obj2);

  return (
    <div className="grid grid-cols-2 gap-8 p-8 border border-1 border-gray-200 rounded-lg">
      <div>
        <h2 className="text-lg font-bold">Before</h2>
        <pre className="text-wrap">
          {Object.keys(differences.removed).map((key) => (
            <div key={key} className="text-red-500">
              {key}: {differences.removed[key as keyof
                IExtensionDeveloperInformation] ?? "null"}
            </div>
          ))}
          {Object.keys(differences.unchanged).map((key) => (
            <div key={key} className="text-gray-500">
              {key}: {differences.unchanged[key as keyof
                IExtensionDeveloperInformation] ?? "null"}
            </div>
          ))}
        </pre>
      </div>
      <div>
        <h2 className="text-lg font-bold">After</h2>
        <pre className="text-wrap">
          {Object.keys(differences.added).map((key) => (
            <div key={key} className="text-green-500">
              {key}: {differences.added[key as keyof
                IExtensionDeveloperInformation] ?? "null"}
            </div>
          ))}
          {Object.keys(differences.unchanged).map((key) => (
            <div key={key} className="text-gray-500">
              {key}: {differences.unchanged[key as keyof
                IExtensionDeveloperInformation] ?? "null"}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
};

export default Diff;
