export const TARGET_ROLES = Object.freeze([
	'Frontend developer',
	'Backend developer',
	'Full-stack developer',
	'AI engineer',
]);

export const ROLE_RELEVANT_SKILLS = Object.freeze({
	'Frontend developer': [
		'JavaScript',
		'TypeScript',
		'React',
		'HTML and CSS',
		'accessibility',
		'responsive design',
		'frontend testing',
		'browser performance',
	],
	'Backend developer': [
		'Node.js',
		'Express',
		'REST APIs',
		'database design',
		'SQL or MongoDB',
		'authentication and authorization',
		'backend testing',
		'security and deployment',
	],
	'Full-stack developer': [
		'JavaScript or TypeScript',
		'React',
		'Node.js',
		'API development',
		'database design',
		'frontend and backend testing',
		'version control',
		'deployment',
	],
	'AI engineer': [
		'Python',
		'machine learning',
		'large language models',
		'prompt engineering',
		'retrieval-augmented generation',
		'vector databases',
		'model evaluation',
		'deployment and monitoring',
	],
});

export function isTargetRole(targetRole) {
	return TARGET_ROLES.includes(targetRole);
}

export function getRelevantSkills(targetRole) {
	const knownRole = TARGET_ROLES.find(
		(role) => role.toLowerCase() === targetRole.trim().toLowerCase(),
	);

	return knownRole ? ROLE_RELEVANT_SKILLS[knownRole] : undefined;
}
