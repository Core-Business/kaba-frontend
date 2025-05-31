
import type { POAActivity } from './schema';

// Helper function to sort sibling activities by their systemNumber
function sortSiblings(siblingActivities: POAActivity[]): POAActivity[] {
  return siblingActivities.sort((a, b) =>
    (a.systemNumber || "").localeCompare(b.systemNumber || "", undefined, { numeric: true, sensitivity: 'base' })
  );
}

// Helper function to get activities in their procedural order
export function getActivitiesInProceduralOrder(allActivities: POAActivity[]): POAActivity[] {
  if (!allActivities || allActivities.length === 0) return [];

  const activitiesMap = new Map(allActivities.map(act => [act.id, act]));
  const orderedActivities: POAActivity[] = [];
  const processedIds = new Set<string>();

  function processActivityRecursive(activity: POAActivity | undefined) {
    if (!activity || processedIds.has(activity.id)) return;

    orderedActivities.push(activity);
    processedIds.add(activity.id);

    if (activity.nextActivityType === 'decision') {
      const yesChildren = sortSiblings(
        allActivities.filter(act => act.parentId === activity.id && act.parentBranchCondition === 'yes')
      );
      yesChildren.forEach(child => processActivityRecursive(activitiesMap.get(child.id)));

      const noChildren = sortSiblings(
        allActivities.filter(act => act.parentId === activity.id && act.parentBranchCondition === 'no')
      );
      noChildren.forEach(child => processActivityRecursive(activitiesMap.get(child.id)));
    } else if (activity.nextActivityType === 'alternatives' && activity.alternativeBranches) {
      activity.alternativeBranches.forEach(branch => {
        const branchChildren = sortSiblings(
          allActivities.filter(act => act.parentId === activity.id && act.parentBranchCondition === branch.id)
        );
        branchChildren.forEach(child => processActivityRecursive(activitiesMap.get(child.id)));
      });
    }
    // No explicit "nextIndividualActivityRef" following here, as we are building the full procedural list.
    // An individual activity's successor (if it's not "FIN" etc.) would just be the next top-level or sibling in a branch.
  }

  const topLevelActivities = sortSiblings(allActivities.filter(act => !act.parentId));
  topLevelActivities.forEach(activity => processActivityRecursive(activitiesMap.get(activity.id)));
  
  // Add any orphaned activities (should ideally not happen with correct parentId/parentBranchCondition linking)
  const remainingActivities = allActivities.filter(act => !processedIds.has(act.id));
  sortSiblings(remainingActivities).forEach(act => {
    if (!processedIds.has(act.id)) { 
        orderedActivities.push(act);
        processedIds.add(act.id);
    }
  });
  
  return orderedActivities;
}
