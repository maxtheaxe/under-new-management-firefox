import { useEffect, useState } from 'react';
import { CHANGELOG_KEY, LAST_CHECK_KEY } from '@/utils/consts.ts';
import type { IChangelogEntry, ILastUpdatedData } from '@/utils/interfaces.ts';
import logo from '../../public/logo-128.png';
import Diff from './Diff';
import './style.css';

const Popup = () => {
	const [changelogData, setChangelogData] = useState<IChangelogEntry[] | null>(
		null,
	);
	const [lastUpdatedData, setLastUpdatedData] =
		useState<ILastUpdatedData | null>(null);

	const updateData = useCallback(async () => {
		updateChangelogData();

		const lastUpdatedData: ILastUpdatedData | null =
			(await browser.storage.local.get(LAST_CHECK_KEY))[LAST_CHECK_KEY] ?? null;

		setLastUpdatedData(lastUpdatedData);
	}, []);

	useEffect(() => {
		updateData();

		browser.storage.local.onChanged.addListener(updateData);
	}, [updateData]);

	async function updateChangelogData() {
		const changelogResult: IChangelogEntry[] =
			(await browser.storage.local.get(CHANGELOG_KEY))[CHANGELOG_KEY] ?? [];

		setChangelogData(changelogResult);
	}

	async function clearChangelog() {
		await browser.storage.local.set({ [CHANGELOG_KEY]: [] });

		await updateChangelogData();

		await browser.action.setBadgeText({ text: '' });
	}

	return (
		<div className="m-8 font-light flex flex-col items-stretch gap-8">
			<div className="flex flex-row gap-3 items-start">
				<img
					className="w-14 rounded-xl overflow-hidden cursor-pointer"
					src={logo}
					alt="Extension logo"
					aria-label="Extension logo"
					onClick={() =>
						open('https://github.com/maxtheaxe/under-new-management-firefox')
					}
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							open('https://github.com/maxtheaxe/under-new-management-firefox');
						}
					}}
				></img>
				<div className="flex flex-col flex-grow">
					<button
						className="text-red-500 mb-2 cursor-pointer"
						onClick={() =>
							open(
								'https://github.com/maxtheaxe/under-new-management-firefox#is-this-a-copy-of-under-new-management',
							)
						}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								open(
									'https://github.com/maxtheaxe/under-new-management-firefox#is-this-a-copy-of-under-new-management',
								);
							}
						}}
						title={'click here!'}
						type="button"
					>
						visit github to read about the recent branding change
					</button>
					<h1 className="text-blue-700 text-2xl">
						Extension Developer Changelog
					</h1>
					<div className="flex flex-row justify-between items-center">
						<span>
							Last updated:{' '}
							{lastUpdatedData
								? `${new Date(
										lastUpdatedData.timestamp,
									).toLocaleDateString()} ${new Date(
										lastUpdatedData.timestamp,
									).toLocaleTimeString()}`
								: ''}
						</span>
					</div>
				</div>

				<button
					className="bg-slate-800 hover:bg-slate-950 text-white font-bold py-2 px-4 rounded border border-slate-950"
					onClick={() =>
						open('https://github.com/maxtheaxe/under-new-management-firefox')
					}
					type="button"
				>
					GITHUB
				</button>

				<button
					className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded border border-red-700"
					onClick={() => clearChangelog()}
					type="button"
				>
					CLEAR
				</button>
			</div>

			{changelogData && changelogData.length > 0 ? (
				changelogData.map((entry: IChangelogEntry) => (
					<Diff
						key={`${entry.timestamp}-${entry.before}-${entry.after}`}
						obj1={entry.before}
						obj2={entry.after}
					></Diff>
				))
			) : (
				<span>No changes detected.</span>
			)}
		</div>
	);
};

export default Popup;
