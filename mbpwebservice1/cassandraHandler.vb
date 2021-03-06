﻿Imports System.Web
Public Class cassandraHandler
    Implements IHttpHandler

    ''' <summary>
    '''  You will need to configure this handler in the Web.config file of your 
    '''  web and register it with IIS before being able to use it. For more information
    '''  see the following link: http://go.microsoft.com/?linkid=8101007
    ''' </summary>
#Region "IHttpHandler Members"

    Public ReadOnly Property IsReusable() As Boolean Implements IHttpHandler.IsReusable
        Get
            ' Return false in case your Managed Handler cannot be reused for another request.
            ' Usually this would be false in case you have some state information preserved per request.
            Return True
        End Get
    End Property

    Public Sub ProcessRequest(ByVal context As HttpContext) Implements IHttpHandler.ProcessRequest

        Dim physicalPath As String = context.Server.MapPath(context.Request.Path)
        Dim file As New System.IO.FileInfo(physicalPath)

        If file.Exists Then
            Dim xDoc As XDocument = XDocument.Load(physicalPath)

            Dim parser As New CWML.CassandraParser

            Dim stdLib As New CWML.StandardParsers(parser) 'Load standard library

            Dim parseContext As New CWML.ParseContext(context.Request, context.Response)

            Dim parsed = parser.Parse(xDoc.Elements.First, parseContext)
            context.Response.Write(parsed.ToString())


        Else
            context.Response.Write("(404) file not found")
        End If

    End Sub

#End Region

End Class
