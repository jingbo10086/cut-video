
import React from 'react';

export const PYTHON_CODE_SNIPPET = `import google.generativeai as genai
from moviepy.editor import VideoFileClip, TextClip, CompositeVideoClip, ColorClip, AudioFileClip, CompositeAudioClip
import json
import os

# 1. 初始化设置
genai.configure(api_key=os.environ["API_KEY"])

def analyze_video_with_gemini(video_path):
    """利用 Gemini 提取多个高光时刻"""
    model = genai.GenerativeModel('gemini-3-pro-preview')
    video_file = genai.upload_file(path=video_path)
    prompt = """请识别出所有学生回答精彩的时间段。返回 JSON 数组，包含 start, end, summary, subtitle 字段。"""
    
    response = model.generate_content(
        [video_file, prompt], 
        generation_config={"response_mime_type": "application/json"}
    )
    return json.loads(response.text)

def process_moments(video_path, moments):
    """批量处理并美化所有时刻"""
    for i, moment in enumerate(moments):
        output_name = f"magic_moment_{i+1}.mp4"
        print(f"正在处理片段 {i+1}: {moment['summary']}")
        
        clip = VideoFileClip(video_path).subclip(moment['start'], moment['end'])
        
        # 视觉特效：金色边框 (10px)
        bg = ColorClip(size=(clip.w+20, clip.h+20), color=(255, 215, 0)).set_duration(clip.duration)
        video_with_border = CompositeVideoClip([bg, clip.set_position("center")])
        
        # 字幕与标题
        title = TextClip("✨ 精彩高光 ✨", fontsize=45, color='white').set_pos(('center', 30)).set_duration(clip.duration)
        sub = TextClip(moment['subtitle'], fontsize=28, color='white', bg_color='black').set_pos(('center', 'bottom')).set_duration(clip.duration)
        
        final = CompositeVideoClip([video_with_border, title, sub])
        
        # 混音
        if os.path.exists("bgm.mp3"):
            bgm = AudioFileClip("bgm.mp3").volumex(0.05).set_duration(clip.duration)
            final = final.set_audio(CompositeAudioClip([final.audio, bgm]))
            
        final.write_videofile(output_name, codec="libx264")
`;

export const JAVA_SPRING_CODE = `package com.edtech.magic.service;
// Java FFmpeg 驱动实现示例...
`;

export const SparkleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="sparkle-effect">
    <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />
  </svg>
);
