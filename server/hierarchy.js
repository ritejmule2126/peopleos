// Server-side Down-Tree Hierarchy & Subordinate Access Controller

/**
 * Recursively resolves all subordinate employee IDs reporting directly or indirectly to seniorId.
 * @param {Array} employees
 * @param {string} seniorId
 * @returns {string[]} array of subordinate employee IDs
 */
export function getDownlineIds(employees, seniorId) {
  const directReports = employees.filter((e) => e.managerId === seniorId);
  let allDownline = directReports.map((e) => e.id);

  for (const report of directReports) {
    const deeper = getDownlineIds(employees, report.id);
    allDownline = allDownline.concat(deeper);
  }

  return allDownline;
}

/**
 * Validates whether requester has security clearance to inspect target employee's logs.
 * @param {Array} employees
 * @param {string} requesterRole - 'FOUNDER' | 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE'
 * @param {string} requesterEmpId
 * @param {string} targetEmpId
 * @returns {boolean}
 */
export function canAccessSubordinate(employees, requesterRole, requesterEmpId, targetEmpId) {
  // Founder and HR Admin have unrestricted organization-wide access
  if (requesterRole === 'FOUNDER' || requesterRole === 'HR_ADMIN') {
    return true;
  }

  // Employee can always inspect own records
  if (requesterEmpId === targetEmpId) {
    return true;
  }

  // Seniors can only access junior subordinates within their downward reporting chain
  const downline = getDownlineIds(employees, requesterEmpId);
  return downline.includes(targetEmpId);
}
