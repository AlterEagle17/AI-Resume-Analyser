export const TARGET_ROLES = Object.freeze([
	'Frontend developer',
	'Backend developer',
	'Full-stack developer',
	'AI engineer',
]);

export function isTargetRole(targetRole) {
	return TARGET_ROLES.includes(targetRole);
}
