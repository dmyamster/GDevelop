// Automatically generated by GDevelop.js/scripts/generate-types.js
declare class gdObjectsContainersList {
  static DoesNotExist: 0;
  static Exists: 1;
  static Number: 2;
  static GroupIsEmpty: 3;
  static ExistsOnlyOnSomeObjectsOfTheGroup: 4;
  static makeNewObjectsContainersListForProjectAndLayout(project: gdProject, layout: gdLayout): gdObjectsContainersList;
  static makeNewObjectsContainersListForContainers(globalObjectsContainer: gdObjectsContainer, objectsContainer: gdObjectsContainer): gdObjectsContainersList;
  getTypeOfObject(objectName: string): string;
  getTypeOfBehavior(name: string, searchInGroups: boolean): string;
  getBehaviorsOfObject(objectOrGroupName: string, searchInGroups: boolean): gdVectorString;
  getBehaviorNamesInObjectOrGroup(objectOrGroupName: string, behaviorType: string, searchInGroups: boolean): gdVectorString;
  getAnimationNamesOfObject(name: string): gdVectorString;
  getTypeOfBehaviorInObjectOrGroup(objectOrGroupName: string, behaviorName: string, searchInGroups: boolean): string;
  hasObjectOrGroupNamed(name: string): boolean;
  hasObjectNamed(name: string): boolean;
  hasObjectOrGroupWithVariableNamed(objectName: string, variableName: string): ObjectsContainersList_VariableExistence;
  getObjectsContainer(index: number): gdObjectsContainer;
  getObjectsContainersCount(): number;
  delete(): void;
  ptr: number;
};