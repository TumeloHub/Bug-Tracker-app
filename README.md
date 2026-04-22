# Bug-Tracker-app

###link to website:
https://bug-fixing-application.netlify.app/

## Overview
The bug tracker app is a web based application that helps users manage software issues/bugs efficiently. It allows users to create, assign, view, and update issues within different projects.

## Purpose
The purpose of this system is to:
- Track bugs and issues in software projects
- Improve organization and accountability
- Provide a simple interface for managing development tasks

## Features
The system supports the following functionality:

- Create issues
- Assign issues to users
- View all issues
- View a single issue in detail
- Edit/update issues
- Manage people (users)
- Manage projects

## Definitions

### Bug
A bug is an error or flaw in a program that causes it to behave incorrectly.

### Ticket
A ticket is a recorded issue or bug that needs to be tracked and resolved.

### Markdown
Markdown is a lightweight markup language used to format documentation.


## System Requirements

### Aesthetic Requirements
- User friendly web interface
- Clear display of issues and their statuses
- Intuitive navigation between pages
- Clean and readable layout

## Functional Requirements

### The system must allow users to:
- Create issues
- Assign issues
- View all issues
- View a specific issue
- Edit issues
- Create people (static or dynamic)
- Create projects (static or dynamic)

## Issue (Ticket) Structure

Each issue contains the following fields:

- Summary
- Description
- Reporter (person who identified the issue)
- Date reported
- Project name
- Assigned user
- Status (Open / Resolved / Overdue)
- Priority (Low / Medium / High)
- Target resolution date
- Actual resolution date
- Resolution summary

## Data Storage

The system uses **localStorage** to store data in the browser.

Stored data includes:
- People
- Projects
- Issues

## How the System Works

1. User creates an issue by filling in a form
2. Issue is saved in localStorage
3. User can view all issues in a list format
4. Clicking an issue displays detailed information
5. Issues can be edited and updated
6. Status and resolution details can be modified


## How to Run the System

1. Open the project folder
2. Locate the `index.html` file
3. Open it in a web browser (e.g Chrome or Edge)


## Technologies Used

- HTML 
- CSS 
- JavaScript
- LocalStorage

## AI Usage Declaration

AI tools were used in the development of this project to assist with explanations, structuring, and refinement of ideas. All outputs were carefully reviewed, verified, and modified where necessary.

This submission represents our own work and understanding. We take full responsibility for its accuracy and integrity, and confirm that the use of AI was supplementary and in line with academic integrity guidelines.

## Future Improvements

- Add database support (e.g MySQL)
- User authentication system
- Search and filter functionality
- Notifications for overdue issues
- Improved UI/UX design

## Reference

- https://en.wikipedia.org/wiki/Bug_tracking_system
