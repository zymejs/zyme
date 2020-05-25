import React from 'react';
import { addons, types } from '@storybook/addons';
import { useParameter } from '@storybook/api';
import { styled } from '@storybook/theming';
import { AddonPanel, SyntaxHighlighter } from '@storybook/components';

const ADDON_ID = 'sources';
const PARAM_KEY = 'sources';
const PANEL_ID = `${ADDON_ID}/panel`;

const StyledSyntaxHighlighter = styled(SyntaxHighlighter)(({ theme }) => ({
    fontSize: theme.typography.size.s2 - 1
}));

const MyPanel = () => {
    const sources = useParameter(PARAM_KEY, null);
    if (!sources) {
        return <div style={{ minWidth: '500px' }}></div>;
    }

    return sources.map(file => {
        const language = file.file.endsWith('.vue')
            ? 'html'
            : file.file.endsWith('.ts')
            ? 'typescript'
            : file.file.endsWith('.scss')
            ? 'scss'
            : file.file.endsWith('.css')
            ? 'css'
            : 'jsx';

        return (
            <div key={file.file} style={{ minWidth: '500px' }}>
                <h2 style={{ fontFamily: 'monospace', padding: '10px' }}>{file.file}</h2>
                <StyledSyntaxHighlighter
                    language={language}
                    showLineNumbers
                    format={false}
                    copyable={false}
                    padded
                >
                    {file.src}
                </StyledSyntaxHighlighter>
            </div>
        );
    });
};

addons.register(ADDON_ID, api => {
    const render = ({ active, key }) => (
        <AddonPanel active={active} key={key}>
            <MyPanel />
        </AddonPanel>
    );
    const title = 'Sources';

    addons.add(PANEL_ID, {
        type: types.PANEL,
        title,
        render,
        paramKey: PARAM_KEY
    });
});
